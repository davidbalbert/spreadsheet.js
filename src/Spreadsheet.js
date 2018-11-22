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
          <div className="spreadsheet__cell spreadsheet__cell--header"></div>
          {
            COLS.map(c => (
              <div className="spreadsheet__cell spreadsheet__cell--header">{c}</div>
            ))
          }
        </div>

        {
          ROWS.map(r => (
            <div className="spreadsheet__row">
              <div className="spreadsheet__cell spreadsheet__cell--header">{r}</div>

              {
                COLS.map(c => (
                  <div className="spreadsheet__cell"></div>
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
