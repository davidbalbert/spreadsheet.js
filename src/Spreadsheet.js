import React, { Component } from 'react';
import ohm from 'ohm-js';

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

class Value {
  constructor(src) {
    this.src = src;
  }

  get val() {
    return this.src;
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

const ROWS = range(1, 50);
const COLS = charRange('A', 'Z');

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

  render() {
    const {selection, data} = this.state;

    return (
      <div className="spreadsheet">
        <FormulaEditor
          onChange={this.updateSelectedCell}
          formula={data[selection] || ""}
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
                    {data[`${c}${r}`] && data[`${c}${r}`].val}
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
