import * as tf from '@tensorflow/tfjs';
import BaseConfig from '../BaseConfig';

export default class AdaGrad extends BaseConfig {
  static displayName = 'Adagrad';
  constructor({
    lr, accumulator,
  } = {}) {
    super();
    this.addNumericProperty({
      name: 'lr',
      label: 'Learning rate',
      value: lr,
      defaultValue: 0.001,
      min: 0,
      max: 1,
      step: 0.001,
    });
    this.addNumericProperty({
      name: 'accumulator',
      label: 'Initial accumulator',
      value: accumulator,
      defaultValue: undefined,
      min: 0,
      max: 0.001,
      step: 0.0001,
    });
  }
  tf = () => tf.train.adagrad(this.getValue('lr'), this.getValue('accumulator'));
}
