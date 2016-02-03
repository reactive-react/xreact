import React, { PropTypes, Component } from 'react'
import {connect} from '../../../../lib/react-most'
import TodoTextInput from './TodoTextInput'
const id = _=>_;
let Header = (props) =>{
    return (
      <header className="header">
          <h1>todos</h1>
          <TodoTextInput newTodo={true}
                         placeholder="What needs to be done?"
                         search={props.actions.search}
          />
      </header>
    )
}

export default connect(()=>{
  return {
    search: (text)=>({type:'search', text}),
  }
})(Header)
