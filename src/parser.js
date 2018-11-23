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

class UnOp {
  constructor(child) {
    this.child = child;
  }
}

class BinOp {
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }
}

class Plus extends BinOp {
  eval() {
    return this.left.eval() + this.right.eval();
  }
}

class Minus extends BinOp {
  eval() {
    return this.left.eval() - this.right.eval();
  }
}

class Times extends BinOp {
  eval() {
    return this.left.eval() * this.right.eval();
  }
}

class Divide extends BinOp {
  eval() {
    return this.left.eval() / this.right.eval();
  }
}

class Pow extends BinOp {
  eval() {
    return this.left.eval() ** this.right.eval();
  }
}

class Neg extends UnOp {
  eval() {
    return -1 * this.child.eval();
  }
}

class Num extends UnOp {
  eval() {
    return this.child;
  }
}

class CellRef extends UnOp {
  eval() {
    throw 'not implemented';
  }
}

const formulaSemantics = formulaGrammar.createSemantics().addOperation('toAst', {
  Formula: function(eq, e) {
    return e.toAst();
  },
  Exp: function(e) {
    return e.toAst();
  },
  AddExp_plus: function(left, op, right) {
    return new Plus(left.toAst(), right.toAst());
  },
  AddExp_minus: function(left, op, right) {
    return new Minus(left.toAst(), right.toAst());
  },
  MulExp_times: function(left, op, right) {
    return new Times(left.toAst(), right.toAst());
  },
  MulExp_divide: function(left, op, right) {
    return new Divide(left.toAst(), right.toAst());
  },
  ExpExp_power: function(left, op, right) {
    return new Pow(left.toAst(), right.toAst());
  },
  PriExp: function(e) {
    return e.toAst();
  },
  PriExp_paren: function(open, exp, close) {
    return exp.toAst();
  },
  PriExp_neg: function(op, e) {
    return new Neg(e.toAst());
  },
  PriExp_pos: function(op, e) {
    return e.toAst();
  },
  number: function(chars) {
    return new Num(parseFloat(this.sourceString));
  },
  cell: function(col, row) {
    return new CellRef(this.sourceString);
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
      return formulaSemantics(this.match).toAst().eval();
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
