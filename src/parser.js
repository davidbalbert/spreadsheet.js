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
  eval(name, cells) {
    return this.left.eval(name, cells) + this.right.eval(name, cells);
  }
}

class Minus extends BinOp {
  eval(name, cells) {
    return this.left.eval(name, cells) - this.right.eval(name, cells);
  }
}

class Times extends BinOp {
  eval(name, cells) {
    return this.left.eval(name, cells) * this.right.eval(name, cells);
  }
}

class Divide extends BinOp {
  eval(name, cells) {
    return this.left.eval(name, cells) / this.right.eval(name, cells);
  }
}

class Pow extends BinOp {
  eval(name, cells) {
    return this.left.eval(name, cells) ** this.right.eval(name, cells);
  }
}

class Neg extends UnOp {
  eval(name, cells) {
    return -1 * this.child.eval(name, cells);
  }
}

class Num extends UnOp {
  eval(name, cells) {
    return this.child;
  }
}

class CellRef extends UnOp {
  eval(name, cells) {
    if (name === this.child) {
      return "#REF!";
    }

    const cell = cells[this.child];

    return cell ? cell.eval(name, cells) : 0;
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

  eval(name, cells) {
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

  eval(name, cells) {
    if (this.match.succeeded()) {
      return formulaSemantics(this.match).toAst().eval(name, cells);
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
