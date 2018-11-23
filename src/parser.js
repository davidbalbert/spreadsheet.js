import ohm from 'ohm-js';

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
    | cell
    | number

  cell  (a cell)
    = upper+ digit+

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
    return parseFloat(this.sourceString);
  },
  cell: function(col, row) {
    return this.sourceString;
  }
});

class Value {
  constructor(src) {
    this.src = src;
  }

  eval() {
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

  eval() {
    if (this.match.succeeded()) {
      return formulaSemantics(this.match).eval();
    } else {
      return "#ERROR!";
    }
  }
}

export default function parse(s) {
  if (s === null) {
    return null;
  } else if (s[0] === '=') {
    return new Formula(s, formulaGrammar.match(s));
  } else {
    return new Value(s);
  }
}
