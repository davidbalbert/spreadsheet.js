import React, { Component } from 'react';
import './Spreadsheet.css';

function range(start, end) {
  let a = [];

  for (let i = start; i < end + 1; i++) {
    a.push(i);
  }

  return a;
}

function charRange(start, end) {
    const startCode = start.charCodeAt(0);
    const endCode = end.charCodeAt(0)

    return range(startCode, endCode).map(n => String.fromCharCode(n));
}

function classSet(obj) {
  let a = [];

  for (let k in obj) {
    if (obj[k]) {
      a.push(k);
    }
  }

  return a.join(' ');
}

class Cell extends Component {
  render() {
    const { header, children } = this.props;

    const className = classSet({
      'spreadsheet__cell': true,
      'spreadsheet__cell--header': header,
    });

    return (
      <div className={className}>{children}</div>
    )
  }
}

const ROWS = range(1, 100);
const COLS = charRange('A', 'Z');

class Spreadsheet extends Component {
  state = {
    data: [1,2,3],
  };

  render() {
    return (
      <div className="spreadsheet">
        <div className="spreadsheet__row">
          <Cell header />
          {
            COLS.map(c => (
              <Cell key={c} header>{c}</Cell>
            ))
          }
        </div>

        {
          ROWS.map(r => (
            <div key={r} className="spreadsheet__row">
              <Cell header>{r}</Cell>
              {
                COLS.map(c => (
                  <Cell key={`${c}${r}`} />
                ))
              }
            </div>
          ))
        }
      </div>
    );
  }
}

export default Spreadsheet;
