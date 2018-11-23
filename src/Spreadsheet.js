import React, { Component } from 'react';
import ohm from 'ohm-js';
import _ from 'underscore';

import './Spreadsheet.scss';

import FormulaEditor from './FormulaEditor';

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

const GRAMMAR_SRC = `
Formula {
  Formula
    = "=" Exp

  Exp
    = AddExp

  AddExp
    = AddExp "+" MulExp  -- plus
    | AddExp "-" MulExp  -- minus
    | MulExp

  MulExp
    = MulExp "*" ExpExp  -- times
    | MulExp "/" ExpExp  -- divide
    | ExpExp

  ExpExp
    = PriExp "^" ExpExp  -- power
    | PriExp

  PriExp
    = "(" Exp ")"  -- paren
    | "+" PriExp   -- pos
    | "-" PriExp   -- neg
    | ident
    | number

  ident  (an identifier)
    = letter alnum*

  number  (a number)
    = digit* "." digit+  -- fract
    | digit+             -- whole
}
`;

const formulaGrammar = ohm.grammar(GRAMMAR_SRC);

const formulaSemantics = formulaGrammar.createSemantics().addOperation('eval', {
  Formula: function(eq, e) {
    return e.eval();
  },
  Exp: function(e) {
    return e.eval();
  },
  AddExp: function(e) {
    return e.eval();
  },
  AddExp_plus: function(left, op, right) {
    return left.eval() + right.eval();
  },
  AddExp_minus: function(left, op, right) {
    return left.eval() - right.eval();
  },
  MulExp_times: function(left, op, right) {
    return left.eval() * right.eval();
  },
  MulExp_divide: function(left, op, right) {
    return left.eval() / right.eval();
  },
  ExpExp_power: function(left, op, right) {
    return left.eval() ** right.eval();
  },
  PriExp: function(e) {
    return e.eval();
  },
  PriExp_paren: function(open, exp, close) {
    return exp.eval();
  },
  PriExp_neg: function(op, e) {
    return -1 * e.eval();
  },
  PriExp_pos: function(op, e) {
    return e.eval();
  },
  number: function(chars) {
    return parseInt(this.sourceString, 10);
  },
});

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

    const className = classSet({
      'spreadsheet__cell': true,
      'spreadsheet__cell--header': header,
      'spreadsheet__cell--selected': selection && name === selection,
      'spreadsheet__cell--number': number && !header,
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

class Value {
  constructor(src) {
    this.src = src;
  }

  get val() {
    if (this.src.match(/^\d+(\.\d+)?$/)) {
      return parseFloat(this.src);
    } else {
      return this.src;
    }
  }
}

class Formula {
  constructor(src, match) {
    this.src = src;
    this.match = match;
  }

  get val() {
    if (this.match.succeeded()) {
      return formulaSemantics(this.match).eval();
    } else {
      return "#ERROR!";
    }
  }
}

const ROWS = _.range(1, 51);
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

function moveSelection(currentSelection, direction) {
  const match = currentSelection.match(/([A-Z]+)(\d+)/);

  if (!match) {
    return currentSelection;
  }

  const [col, row] = [match[1], parseInt(match[2], 10)];

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
};

class Spreadsheet extends Component {
  state = {
    selection: "A1",
    data: {},
  };

  selectCell = (name) => {
    this.setState({selection: name});
  }

  updateSelectedCell = (value) => {
    const {data, selection} = this.state;

    let cell;
    if (value[0] === '=') {
      cell = new Formula(value, formulaGrammar.match(value));
    } else {
      cell = new Value(value);
    }

    this.setState({
      data: {
        ...data,
        [selection]: cell,
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
    }
  }

  render() {
    const {selection, data} = this.state;

    return (
      <div
        className="spreadsheet"
        tabIndex="0"
        onKeyDown={this.handleKeyDown}
      >
        <FormulaEditor
          onChange={this.updateSelectedCell}
          formula={data[selection] || ""}
          selection={selection}
        />
        <div className="spreadsheet__row">
          <Cell header />
          {
            COLS.map(c => (
              <Cell key={c} value={c} header />
            ))
          }
        </div>

        {
          ROWS.map(r => (
            <div key={r} className="spreadsheet__row">
              <Cell value={r} header />
              {
                COLS.map(c => (
                  <Cell
                    key={`${c}${r}`}
                    name={`${c}${r}`}
                    selection={selection}
                    onClick={this.selectCell}
                    value={data[`${c}${r}`] && data[`${c}${r}`].val}
                  />
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
