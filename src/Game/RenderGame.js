import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Row from './Row';

class Game extends Component {
  
  render() {
    return (
      _.map(this.props.game, (row, i)  => {
        return (<Row key={i} row={row} />);
      })
    );
  }
}

Game.propTypes = {
  game: PropTypes.array
}

export default Game;
