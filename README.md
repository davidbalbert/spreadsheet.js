# spreadsheet.js

A simple spreadsheet using React and [ohm](https://github.com/harc/ohm/). Supports arithmetic formulas including cell references (e.g. `= A1 + B2`), and keyboard navigation.

## Running

With yarn:

```
$ yarn install
$ yarn start
```

With npm:

```
$ npm install
$ npm start
```

## Usage

Arrow keys navigate around the spreadsheet. Clicking works too. Enter focuses the formula editor. When you're in the formula editor, enter and escape focuses the spreadsheet.
