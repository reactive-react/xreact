import React, { PropTypes, Component } from 'react'
import TodoTextInput from './TodoTextInput'
let Header = (props) =>{
    return (
      <header className="header">
          <h1>todos</h1>
          <TodoTextInput newTodo={true}
                         placeholder="What needs to be done?"
                         {...props}
          />
      </header>
    )
}

export default Header
