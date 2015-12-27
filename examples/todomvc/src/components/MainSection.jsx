import React, { Component, PropTypes } from 'react'
import TodoItem from './TodoItem'
import Footer from './Footer'
import {TxMixin} from 'mostux'
import actions from './MainSection.action'
const todos = [{
  text: 'Dont Use Redux',
  completed: false,
  id: 0
},{
  text: 'Use mostux',
  completed: false,
  id: 1
}];

let MainSection = React.createClass({
  mixins: [TxMixin],
  getInitialState(){
    return {
      todos: todos,
      filter: _=>_
    }
  },
  componentDidMount(){
    this.bindActions(actions)
  },

  handleShow(filter) {
    this.setState({ filter })
  },

  renderToggleAll(completedCount) {
    const { todos } = this.state
    if (todos.length > 0) {
      return (
        <input className="toggle-all"
               type="checkbox"
               checked={completedCount === todos.length}
               />
      )
    }
  },

  renderFooter(completedCount) {
    const { todos } = this.state
    const activeCount = todos.length - completedCount;

    if (todos.length) {
      return (
        <Footer completedCount={completedCount} activeCount={activeCount} {...this.props}/>
      )
    }
  },

  render() {
    const { actions } = this.props
    const {todos} = this.state
    const completedCount = todos.reduce((count, todo) =>
      todo.completed ? count + 1 : count,
                                        0
    );

    const filteredTodos = this.state.filter(todos);
    return (
      <section className="main">
        {this.renderToggleAll(completedCount)}
        <ul className="todo-list">
          {filteredTodos.map(todo =>
            <TodoItem key={todo.id} todo={todo} {...this.props} />
          )}
        </ul>
        {this.renderFooter(completedCount)}
      </section>
    )
  },
});

export default MainSection
