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

  render() {
    const {todos,filter} = this.props
    if(!todos) return <section className="main"/>
    const completedCount = todos.reduce((count, todo) =>
      todo.done ? count + 1 : count,
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
        <Footer completedCount={completedCount} activeCount={todos.length-completedCount} {...this.props}/>
      </section>
    )
  },
});

export default MainSection
