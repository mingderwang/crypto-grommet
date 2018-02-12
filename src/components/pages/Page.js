import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Heading,
  Paragraph,
  Anchor,
  RoutedAnchor,
} from 'grommet';
import TopMenu from '../TopMenu';

export default class Page extends Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const { children, desc, name } = this.props;
    let header;
    if (name) {
      header = (
        <Box direction='row' responsive={true}>
          <Box margin={{ vertical: 'large' }} align='start'>
            <Heading level={1}>
              <strong>{name}</strong>
            </Heading>
            {desc ? (
              <Paragraph size='large'>
                {desc}
              </Paragraph>
            ) : null}
          </Box>
        </Box>
      );
    }
    return (
      <Box>
        <Box pad={{ horizontal: 'large', top: 'medium' }}>
          <TopMenu />
          {header}
          {children}
        </Box>


        <Box
          direction='row'
          justify='center'
          pad={{ top: 'xlarge' }}
        >
          <Box
            basis='large'
            pad='large'
            border='top'
            direction='row'
            justify='center'
          >
            <Box margin={{ horizontal: 'small' }}>
              <RoutedAnchor path='/about' label='about' />
            </Box>
            <Box margin={{ horizontal: 'small' }}>
              <Anchor href='https://github.com/atanasster/crypto-grommet' target='_blank' label='git' />
            </Box>

          </Box>
        </Box>
      </Box>
    );
  }
}

Page.propTypes = {
  desc: PropTypes.object,
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

Page.defaultProps = {
  desc: undefined,
  name: undefined,
};