import * as React from 'react'
import { Component, PropTypes } from 'react'
import * as classnames from 'classnames'
import MainSection from './MainSection'
import { x } from 'xreact/lib/x'
import TodoItem from './TodoItem'
import * as Intent from '../intent'
import { Todo } from './interfaces'
import { just } from 'most'
import { identity as id } from 'ramda'
let TodoTextInput = React.createClass({
  getInitialState() {
    return {
      text: this.props.text || ''
    }
  },

  handleSubmit(e) {
    const text = e.target.value.trim()
    let msg = { id: this.props.itemid, text: text }
    if (e.which === 13) {
      if (this.props.newTodo) {
        this.props.actions.add(msg);
        this.setState({ text: '' })
      }
    }
  },

  handleChange(e) {
    this.setState({ text: e.target.value })
  },

  handleBlur(e) {
    if (!this.props.newTodo) {
      this.props.actions.edit({ id: this.props.itemid, text: e.target.value }, this.props.index);
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
        autoFocus={true}
        value={this.state.text}
        onBlur={this.handleBlur}
        onChange={this.handleChange}
        onKeyDown={this.handleSubmit} />
    )
  },
});

export default x(intent$ => (
  {
    update$: just(id),
    actions: {
      add: (value) => ({ kind: 'add', value } as Intent.Add<Todo>)
    }
  }
))(TodoTextInput)
