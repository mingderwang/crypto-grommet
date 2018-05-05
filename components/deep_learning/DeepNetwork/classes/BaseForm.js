/**
 * Created by atanasster on 6/5/17.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Box } from 'grommet';
import { Form } from 'grommet-controls';
import PropertyText from '../properties/PropertyText';
import PropertyNumber from '../properties/PropertyNumber';
import PropertyBoolean from '../properties/PropertyBoolean';
import NumericField from '../properties/NumericField';
import SelectField from '../properties/SelectField';
import BooleanField from '../properties/BooleanField';


export default class BaseForm extends Component {
  constructor(props) {
    super(props);
    this.state = { value: props.value };
    this.properties = [];
  }

  onUpdateValue = (name, value, defaultValue) => {
    const { onUpdateValue } = this.props;
    let newState = { ...this.state.value };
    if (value !== defaultValue) {
      newState = { ...this.state.value, [name]: value };
    } else {
      delete newState[name];
    }
    this.setState({ value: newState });
    onUpdateValue(newState);
  }

  propValue(name) {
    if (this.props.value[name] !== undefined) {
      return this.props.value[name];
    }
    return this.props.defaults[name];
  }
  addProperty(cls, props) {
    const property = React.createElement(cls, {
      ...props,
      onUpdateValue: this.onUpdateValue,
      default: this.props.defaults[props.name],
    });
    this.properties.push({ obj: null, property });
  }

  addTextProperty({ name, label, help }) {
    this.addProperty(PropertyText, {
      name,
      label,
      help,

      value: this.propValue(name),
      key: `form_${name}_${this.properties.length}`,
    });
  }
  addNumberProperty({
    name, label, help, min, max, step,
  }) {
    this.addProperty(PropertyNumber, {
      name,
      label,
      help,
      value: this.propValue(name),
      min,
      max,
      step,
      key: `form_${name}_${this.properties.length}`,
    });
  }

  addNumericField({
    name, label, help, min, max, step, decimals,
  }) {
    this.addProperty(NumericField, {
      name,
      label,
      help,
      value: this.propValue(name),
      min,
      max,
      step,
      decimals,
      key: `form_${name}_${this.properties.length}`,
    });
  }

  addSelectField({
    name, label, help, options,
  }) {
    this.addProperty(SelectField, {
      name,
      label,
      help,
      value: this.propValue(name),
      options,
      key: `form_${name}_${this.properties.length}`,
    });
  }

  addBooleanProperty({ name, label, help }) {
    this.addProperty(PropertyBoolean, {
      name,
      label,
      help,
      value: this.props.value[name],
      key: `form_${name}_${this.properties.length}`,
    });
  }

  addBooleanField({ name, label, help }) {
    this.addProperty(BooleanField, {
      name,
      label,
      help,
      value: this.props.value[name],
      key: `form_${name}_${this.properties.length}`,
    });
  }


  render() {
    const { notForm } = this.props;
    const children = this.properties.map(prop => prop.property);
    return notForm ? (<Box pad={{ bottom: 'small' }} gap='small'>{children}</Box>) : (
      <Form size='small' pad={{ bottom: 'small' }} gap='small'>{children}</Form>
    );
  }
}

BaseForm.defaultProps = {
  notForm: undefined,
};

BaseForm.propTypes = {
  value: PropTypes.object.isRequired,
  defaults: PropTypes.object.isRequired,
  notForm: PropTypes.bool,
  onUpdateValue: PropTypes.func.isRequired,
};
