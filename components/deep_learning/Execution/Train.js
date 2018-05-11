import React from 'react';
import PropTypes from 'prop-types';
import * as tf from '@tensorflow/tfjs';
import { Box, Button, Text } from 'grommet';
import Value from '../../grommet-controls/Value/Value';
import LossHistoryChart from './LossHistoryChart';
import { prepareTestTrainData } from '../../../tensorflow/run/data_preparation';
import createTFModel from '../../../tensorflow/run/create_model';
import tensorflow from '../../../tensorflow/config';
import { formatTraingTime, periodToTime } from '../utils';
import { ModelContext } from '../StateProvider';

class TrainModel extends React.Component {
  state = {
    trainingStats: undefined,
  };

  static contextTypes = {
    client: PropTypes.object.isRequired,
  };

  updateStatus = (status) => {
    this.setState({ trainingStats: { ...this.state.trainingStats, status: `${status}...` } });
  };

  componentDidMount() {
    // http://jsfiddle.net/jlubean/dL5cLjxt/
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      safari: !!navigator.userAgent.match(/Version\/[\d]+.*Safari/),
      iOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
    });
  }

  async onTrain(model, addToHistory) {
    const trainingStats = { history: { loss: [], val_loss: [] } };
    this.setState({ trainingStats });
    if (this.state.safari || this.state.iOS) {
      tf.setBackend('cpu');
      console.log('scaling down to CPU');
    } else {
      tf.setBackend('webgl');
    }
    const beginMs = Date.now();
    try {
      const {
        xTrain, yTrain, xTest, yTest, scalers,
      } = await prepareTestTrainData(model, (status => this.updateStatus(status)));
      let xTrainR;
      let xTestR;
      if (model.layers.length > 0 && ['LSTM', 'GRU', 'SimpleRNN']
        .indexOf(model.layers[0].config.type) !== -1) {
        xTrainR = xTrain.reshape([xTrain.shape[0], xTrain.shape[1], 1]);
        xTestR = xTest.reshape([xTest.shape[0], xTest.shape[1], 1]);
      } else {
        xTrainR = xTrain;
        xTestR = xTest;
      }
      console.log('data shape:', xTrainR.shape, yTrain.shape, xTestR.shape, yTest.shape);
      const scaler = scalers[scalers.length - 1];
      const tfModel = createTFModel(model, xTrainR.shape.slice(1));
      const optimizer = tensorflow.createObject(model.optimizer);
      tfModel.compile({
        loss: model.loss,
        optimizer: optimizer.tf(),
      });

      // Train the model using the data.
      const history = await tfModel.fit(xTrainR, yTrain, {
        epochs: model.epochs,
        batchSize: model.batchSize,
        validationData: [xTestR, yTest],
        callbacks: {
          onTrainBegin: async () => {
            this.updateStatus('training started');
            await tf.nextFrame();
          },
          onTrainEnd: async () => {
            this.updateStatus('training end');
            await tf.nextFrame();
          },
          onBatchEnd: async () => {
            // give time for UI to update
            await tf.nextFrame();
          },

          onEpochEnd: async (epoch, logs) => {
            if (!Number.isNaN(logs.loss)) {
              // eslint-disable-next-line camelcase
              const { loss, val_loss: valLoss } = logs;
              const scaledLoss = loss / scaler;
              const scaledValLoss = valLoss / scaler;
              trainingStats.history.loss = [...trainingStats.history.loss, scaledLoss];
              trainingStats.history.val_loss = [...trainingStats.history.val_loss, scaledValLoss];
              this.setState({
                trainingStats: {
                  epoch: epoch + 1,
                  loss: scaledLoss,
                  valLoss: scaledValLoss,
                  timing: (Date.now() - beginMs).toFixed(0),
                  history: trainingStats.history,
                },
              });
            }
            await tf.nextFrame();
          },
        },
      });
      const timing = (Date.now() - beginMs).toFixed(0);
      if (history.history.loss.length > 0) {
        const loss = history.history.loss.map(v => v / scaler);
        const valLoss = history.history.val_loss.map(v => v / scaler);
        const savedLayers = model.layers.map((layer, index) => {
          // eslint-disable-next-line no-param-reassign
          const weights = [];
          if (history.model.layers.length >= index) {
            const tfLayer = history.model.layers[index + 1];
            tfLayer.weights.forEach((weight) => {
              const data = weight.read()
                .dataSync();
              const { shape } = weight;
              weights.push({ data, shape, name: weight.name });
            });
          }
          return { ...layer, weights };
        });
        const item = {
          tfModel: JSON.stringify(history.model.getConfig()),
          model: { ...model, layers: savedLayers },
          epoch: model.epochs,
          scalers,
          date: Date.now(),
          timing,
          loss: loss[loss.length - 1],
          valLoss: valLoss[valLoss.length - 1],
          history: {
            loss,
            val_loss: valLoss,
          },
        };
        addToHistory(item);
      }
      // const preditions = await makePredictions(model);
    } finally {
      this.setState({ trainingStats: undefined });
    }
  }
  render() {
    return (
      <ModelContext.Consumer>
        {({ model, addToHistory, lastTrained = {} }) => {
          const { trainingStats } = this.state;
          const {
            timing, status, date, loss, valLoss, epoch, history,
          } = trainingStats || lastTrained;
          const { time, units } = periodToTime(timing);
          let statusText;
          if (status) {
            statusText = status;
          } else if (date) {
            statusText = `last: ${formatTraingTime(date)}`;
          }
          return (
            <Box
              direction='row'
              align='center'
              justify='between'
              fill='horizontal'
              border='horizontal'
              pad={{ vertical: 'small' }}
            >
              <Box gap='small' align='center'>
                <Button
                  onClick={this.state.trainingStats ? undefined :
                    () => this.onTrain(model, addToHistory)}
                  label='train'
                />
                <Text size='small'>{statusText}</Text>
              </Box>
              <Box direction='row' gap='medium'>
                <Value label='epoch' value={epoch} />
                <Value label='loss (mse)' value={loss ? loss.toFixed(5) : undefined} />
                <Value label='val. loss (mse)' value={valLoss ? valLoss.toFixed(5) : undefined} />
                <Value label={`duration (${units})`} value={time} />
              </Box>
              <LossHistoryChart
                loss={history && history.loss ? history.loss : undefined}
                valLoss={history && history.val_loss ? history.val_loss : undefined}
              />
            </Box>
          );
        }}
      </ModelContext.Consumer>
    );
  }
}

export default TrainModel;
