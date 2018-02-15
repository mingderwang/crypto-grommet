import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Box, Text, RoutedAnchor } from 'grommet';
import CardScroll from '../../components/CardScroll';
import Coin from '../../components/Coin';
import Card from '../../components/cards/Card';
import ExchangePage from '../../components/pages/ExchangePage';
import Table from '../../components/table/Table';
import requestExchangeInfo from '../../actions/exchange/actions';

class ExchangeCurrencies extends Component {
  componentDidMount() {
    this.props.requestExchangeInfo(this.props.match.params.exchange);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.exchange !== this.props.match.params.exchange) {
      this.props.requestExchangeInfo(nextProps.match.params.exchange);
    }
  }
  renderItem = (label, value) => (
    <Box direction='row' responsive={false}>
      <Text >{label}:</Text>
      <Text >{value || 'N/A'}</Text>
    </Box>
  );

  renderCountries = (countries) => {
    if (typeof countries === 'string') {
      return this.renderItem('Country', countries);
    }
    return this.renderItem('Countries', countries.join());
  };
  renderCurrencyPairs(currency) {
    const { exchange: { markets, name: exchanegName } } = this.props;
    const pairs = Object.keys(markets).filter(key =>
      key.startsWith(`${currency}/`)).map(key => (markets[key]));
    return (
      <Table
        data={pairs}
        columns={[
          {
            accessor: 'symbol',
            Header: 'Symbol',
            Cell: props => (
              <RoutedAnchor path={`/coins/general/${props.value}/${exchanegName}`}>
                {props.value}
              </RoutedAnchor>),
          }, {
            accessor: 'darkpool',
            Header: 'DP',
          }, {
            accessor: 'maker',
            Header: 'Maker',
          }, {
            accessor: 'taker',
            Header: 'Taker',
          },
        ]}
      />
    );
  }
  render() {
    const { exchange, defaultCurrency } = this.props;
    let currencies;
    if (exchange.currencies) {
      currencies = Object.keys(exchange.currencies).map((key) => {
        const currency = exchange.currencies[key];
        return (
          <Card
            key={`curr${currency.code}`}
            title={(
              <Coin
                symbol={currency.code}
                toSymbol={defaultCurrency}
                exchange={exchange.name}
              />
            )}
            subTitle={`precision: ${currency.precision}`}
          >
            {this.renderCurrencyPairs(currency.code)}
          </Card>
        );
      });
    }
    return (
      <ExchangePage exchange={exchange.name} >
        <CardScroll>
          {currencies}
        </CardScroll>
      </ExchangePage>
    );
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({ requestExchangeInfo }, dispatch);

const mapStateToProps = (state, props) =>
  ({
    exchange: state.exchange[props.match.params.exchange] ||
  { id: props.match.params.exchange, name: props.match.params.exchange },
    defaultCurrency: state.settings.defaultCurrency,
  });

export default connect(mapStateToProps, mapDispatchToProps)(ExchangeCurrencies);
