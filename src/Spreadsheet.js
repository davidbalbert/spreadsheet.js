import React, { Component } from 'react';
import _ from 'underscore';

import './App.scss'
import './Spreadsheet.scss';

import FormulaEditor from './FormulaEditor';
import parse from './parser';

function charRange(start, end) {
    const startCode = start.charCodeAt(0);
    const endCode = end.charCodeAt(0) + 1;

    return _.range(startCode, endCode).map(n => String.fromCharCode(n));
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
    const {header, value, selection, name} = this.props;

    const number = value && typeof value === "number";

    let highlighted = false;
    if (header && selection) {
      const [row, col] = splitName(selection);

      highlighted = row === name || col === name;
    }

    const className = classSet({
      'spreadsheet__cell': true,
      'spreadsheet__cell--header': header,
      'spreadsheet__cell--number': number && !header,
      'spreadsheet__cell--selected': selection && name === selection,
      'spreadsheet__cell--highlighted': highlighted,
    });

    return (
      <div
        className={className}
        onClick={this.handleClick}
      >
        {value}
      </div>
    )
  }
}

const ROWS = _.range(1, 33);
const COLS = charRange('A', 'Z');

// does not support multiple character columns (AA, AB, AC, etc.)
function nextCol(c) {
  if (c === _.last(COLS)) {
    return c;
  } else {
    return String.fromCharCode(c.charCodeAt(0) + 1);
  }
}

function prevCol(c) {
  if (c === COLS[0]) {
    return c;
  } else {
    return String.fromCharCode(c.charCodeAt(0) - 1);
  }
}

function nextRow(r) {
  if (r === _.last(ROWS)) {
    return r;
  } else {
    return r + 1;
  }
}

function prevRow(r) {
  if (r === ROWS[0]) {
    return r;
  } else {
    return r - 1;
  }
}

function splitName(name) {
  const match = name.match(/([A-Z]+)(\d+)/);

  if (!match) {
    return null;
  }

  return [match[1], parseInt(match[2], 10)];
}

function moveSelection(currentSelection, direction) {
  const pair = splitName(currentSelection);

  if (pair === null) {
    return currentSelection;
  }

  const [col, row] = pair;

  switch (direction) {
    case 'up':
      return `${col}${prevRow(row)}`;
    case 'down':
      return `${col}${nextRow(row)}`;
    case 'right':
      return `${nextCol(col)}${row}`;
    case 'left':
      return `${prevCol(col)}${row}`;
    default:
      return currentSelection;
  }

}

const Keys = {
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  DOWN: 40,

  ENTER: 13,
  ESC: 27,
  DEL: 8,
};

class Spreadsheet extends Component {
  state = {
    selection: "A1",
    cells: {},
  };

  spreadsheetRef = React.createRef();
  editorRef = React.createRef();

  componentDidMount() {
    this.spreadsheetRef.current.focus();
  }

  selectCell = (name) => {
    this.setState({selection: name});
  }

  updateSelectedCell = (value) => {
    const {cells, selection} = this.state;

    this.setState({
      cells: {
        ...cells,
        [selection]: parse(value),
      }
    });
  }

  handleKeyDown = (e) => {
    const {selection} = this.state;

    e.preventDefault();

    switch (e.keyCode) {
      case Keys.RIGHT:
        this.setState({
          selection: moveSelection(selection, 'right'),
        });
        break;
      case Keys.LEFT:
        this.setState({
          selection: moveSelection(selection, 'left'),
        });
        break;
      case Keys.UP:
        this.setState({
          selection: moveSelection(selection, 'up'),
        })
        break;
      case Keys.DOWN:
        this.setState({
          selection: moveSelection(selection, 'down'),
        });
        break;
      case Keys.ENTER:
        this.editorRef.current.focus();
        break;
      case Keys.DEL:
        this.updateSelectedCell(null);
        break;
    }
  }

  handleFormulaEditorKeyDown = (e) => {
    switch (e.keyCode) {
      case Keys.ENTER:
      case Keys.ESC:
        this.spreadsheetRef.current.focus();
        break;
    }
  }

  render() {
    const {selection, cells} = this.state;

    return (
      <div className="app">
        <FormulaEditor
          onChange={this.updateSelectedCell}
          formula={cells[selection] || ""}
          selection={selection}
          ref={this.editorRef}
          onKeyDown={this.handleFormulaEditorKeyDown}
        />
        <div
          className="spreadsheet"
          tabIndex="0"
          onKeyDown={this.handleKeyDown}
          ref={this.spreadsheetRef}
        >
          <div className="spreadsheet__row">
            <Cell header />
            {
              COLS.map(c => (
                <Cell
                  key={c}
                  value={c}
                  name={c}
                  selection={selection}
                  header
                />
              ))
            }
          </div>

          {
            ROWS.map(r => (
              <div key={r} className="spreadsheet__row">
                <Cell
                  value={r}
                  name={r}
                  selection={selection}
                  header
                />
                {
                  COLS.map(c => (
                    <Cell
                      key={`${c}${r}`}
                      name={`${c}${r}`}
                      selection={selection}
                      onClick={this.selectCell}
                      value={cells[`${c}${r}`] && cells[`${c}${r}`].eval(`${c}${r}`, cells)}
                    />
                  ))
                }
              </div>
            ))
          }
        </div>
      </div>
    );
  }
}

export default Spreadsheet;
