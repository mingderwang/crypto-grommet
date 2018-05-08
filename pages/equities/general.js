import React from 'react';
import { withRouter } from 'next/router';
import { compose, graphql } from 'react-apollo';
import App from '../../components/App';
import Equity from '../../components/equities/Equity';
import connect from '../../redux';
import withData from '../../apollo/withData';
import { equityDetailsQuery } from '../../graphql/equities';
import EquityDashboard from '../../components/equities/EquityDashboard';

export const EquityInfo = ({ symbol, data: { equity } }) => (
  <App
    title={`${symbol}`}
    description={equity && equity.description}
    visibleTitle={equity && <Equity size='large' equity={equity} />}
  >
    {equity && (
      <EquityDashboard symbol={symbol} />
    )}
  </App>
);


const mapStateToProps = (state, props) => {
  const symbol = props.router.query.symbol || 'AAPL';
  return {
    symbol,
  };
};


export default withRouter(withData(connect(mapStateToProps)(compose(
  graphql(equityDetailsQuery, { options: props => ({ variables: { symbol: props.symbol } }) }),
)(EquityInfo))));
