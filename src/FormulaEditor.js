import React, { Component } from 'react';
import './FormulaEditor.scss'

class FormulaEditor extends Component {
  inputRef = React.createRef();

  handleInputChange = (e) => {
    const {onChange} = this.props;

    onChange(e.target.value);
  }

  handleKeyDown = (e) => {
    const {onKeyDown} = this.props;

    onKeyDown(e);
  }

  focus() {
    this.inputRef.current.focus()
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
          ref={this.inputRef}
          onKeyDown={this.handleKeyDown}
        />
      </div>
    );
  }
}

export default FormulaEditor;
