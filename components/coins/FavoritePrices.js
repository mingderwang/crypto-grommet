import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'grommet';
import connect from '../../redux/index';
import CardScroll from '../CardScroll';
import PriceCard from './PriceCard';

const FavoritePrices = ({
  favCoins, exchange, responsive, numCards,
}) => {
  const cards = favCoins.slice(0, numCards).map((pair, index) => {
    const colors = [
      'brand', 'accent-1', 'accent-2', 'neutral-1', 'neutral-2', 'neutral-3', 'status-ok', 'status-warning',
    ];
    const colorIdx = index % colors.length;
    return (
      <PriceCard
        key={`history_${index}`}
        color={colors[colorIdx]}
        symbol={pair.symbol}
        toSymbol={pair.toSymbol}
        exchange={exchange}
      />
    );
  });
  return (
    <Box margin={{ bottom: 'xsmall' }} pad='xsmall' align='center'>
      <CardScroll responsive={responsive}>
        {cards}
      </CardScroll>
    </Box>
  );
};

FavoritePrices.defaultProps = {
  numCards: 6,
};

FavoritePrices.propTypes = {
  numCards: PropTypes.number,
};
const mapStateToProps = (state, props) => ({
  favCoins: state.settings.favCoins,
  responsive: state.nav.responsive,
  exchange: props.exchange || state.settings.aggregatedExchange,
});

export default connect(mapStateToProps)(FavoritePrices);
