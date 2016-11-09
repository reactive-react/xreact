import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import MainSection from './MainSection'
import {connect} from 'react-most'
import TodoItem from './TodoItem'
let TodoTextInput = React.createClass({
  getInitialState(){
    return {
      text: this.props.text || ''
    }
  },

  handleSubmit(e) {
    const text = e.target.value.trim()
    let msg = {id:this.props.itemid,text:text}
    if (e.which === 13) {
      if (this.props.newTodo) {
        this.props.actions.add(msg);
        this.props.search('')
        this.setState({ text: '' })
      }
    }
  },

  handleChange(e) {
    if (this.props.newTodo)
      this.props.search(e.target.value)
    this.setState({ text: e.target.value })
  },

  handleBlur(e) {
    if (!this.props.newTodo) {
      this.props.actions.edit({id:this.props.itemid,text:e.target.value});
      this.props.actions.editing(-1);
    }
  },

  render() {
    return (
      <input className={
        classnames({
          edit: this.props.editing,
          'new-todo': this.props.newTodo
        })}
        type="text"
        placeholder={this.props.placeholder}
        autoFocus="true"
        value={this.state.text}
        onBlur={this.handleBlur}
        onChange={this.handleChange}
        onKeyDown={this.handleSubmit} />
    )
  },
});

export default TodoTextInput
