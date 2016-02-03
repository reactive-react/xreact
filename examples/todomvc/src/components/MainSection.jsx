import React, { Component, PropTypes } from 'react'
import TodoItem from './TodoItem'
import Footer from './Footer'

let MainSection = (props) => {
  const {todos,filter} = props
  if(!todos) return <section className="main"/>
  const completedCount = todos.reduce((count, todo) =>
  todo.done ? count + 1 : count, 0);

  const filteredTodos = filter(todos);
  return (
  <section className="main">
    <ul className="todo-list">
      {filteredTodos.map(todo =>
        <TodoItem key={todo.id} todo={todo} {...props} />
       )}
    </ul>
    <Footer completedCount={completedCount} activeCount={todos.length-completedCount} {...props}/>
  </section>
  )
}

export default MainSection
