import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTruckPickup } from '@fortawesome/free-solid-svg-icons'

class Row extends Component {
  
  render() {
    return (
        <div className="row">
            {this.props.row.map((node, i) => {
                if (i < 12) {
                    return (
                        <div className={'road col-xs-1'} key={i}>
                            {node === 1 ? <FontAwesomeIcon size='3x' icon={faTruckPickup} /> : null}
                        </div>
                    );
                } else {
                    return (<div></div>)
                }
            })}
        </div>
    );
  }
}

Row.propTypes = {
  row: PropTypes.array
}

export default Row;
