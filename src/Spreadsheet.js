import React, { Component } from 'react';
import './Spreadsheet.scss';

import FormulaEditor from './FormulaEditor';

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
  handleClick = (e) => {
    const {onClick, name} = this.props;

    if (onClick) {
      onClick(name);
    }
  }

  render() {
    const {header, children, selected} = this.props;

    const className = classSet({
      'spreadsheet__cell': true,
      'spreadsheet__cell--header': header,
      'spreadsheet__cell--selected': selected,
    });

    return (
      <div
        className={className}
        onClick={this.handleClick}
      >
        {children}
      </div>
    )
  }
}

const ROWS = range(1, 50);
const COLS = charRange('A', 'Z');

class Spreadsheet extends Component {
  state = {
    selection: null,
    data: {},
  };

  selectCell = (name) => {
    this.setState({selection: name});
  }

  updateSelectedCell = (value) => {
    const {data, selection} = this.state;

    this.setState({
      data: {
        ...data,
        [selection]: value,
      }
    });
  }

  render() {
    const {selection, data} = this.state;

    return (
      <div className="spreadsheet">
        <FormulaEditor
          onChange={this.updateSelectedCell}
          value={data[selection] || ""}
          selection={selection}
        />
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
                  <Cell
                    key={`${c}${r}`}
                    name={`${c}${r}`}
                    selected={selection === `${c}${r}`}
                    onClick={this.selectCell}
                  >
                    {data[`${c}${r}`]}
                  </Cell>
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
