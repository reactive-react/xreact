import React, { Component, PropTypes } from 'react'
import TodoItem from './TodoItem'
import Footer from './Footer'

let MainSection = React.createClass({
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
    const {todos,filter} = this.props
    if(!todos) return <div/>
    const completedCount = todos.reduce((count, todo) =>
      todo.completed ? count + 1 : count,
                                        0
    );

    const filteredTodos = filter(todos);
    return (
      <section className="main">
        <ul className="todo-list">
          {filteredTodos.map(todo =>
            <TodoItem key={todo.id} todo={todo} {...this.props} />
          )}
        </ul>
      </section>
    )
  },
});

export default MainSection
