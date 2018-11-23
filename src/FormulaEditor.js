import React, { Component } from 'react';
import './FormulaEditor.scss'

class FormulaEditor extends Component {
  handleInputChange = (e) => {
    const {onChange} = this.props;

    onChange(e.target.value);
  }
  render() {
    const {selection, formula} = this.props;

    return (
      <div className="formula-editor">
        <input
          className="formula-editor__input"
          disabled={!selection}
          onChange={this.handleInputChange}
          value={formula.src || ""}
        />
      </div>
    );
  }
}

export default FormulaEditor;
