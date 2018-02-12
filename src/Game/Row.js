import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Row extends Component {
  
  render() {
    return (
        <div className="row">
            {this.props.row.map((node, i) => {
                if (i < 12) {
                    const cn = node === 1 ? 'bg-danger col-xs-1' : 'col-xs-1';
                    return (
                        <div className={cn} key={i}>
                            {node}
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
