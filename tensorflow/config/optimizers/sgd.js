import * as tf from '@tensorflow/tfjs';
import BaseConfig from '../BaseConfig';

export default class SGD extends BaseConfig {
  static displayName = 'SGD';
  constructor({ lr } = {}) {
    super();
    this.addNumericProperty({
      name: 'lr',
      label: 'Learning rate',
      value: lr,
      defaultValue: 0.01,
      min: 0,
      max: 1,
      step: 0.001,
    });
  }
  tf = () => tf.train.sgd(this.getPropValue('lr'));
}
