import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import TodoTextInput from './TodoTextInput'
import MainSection from './MainSection'

class TodoItem extends React.Component {
  constructor(props){
    super(props);
    this.state = {editing:false};
  }
  render() {
    const { todo,actions } = this.props

    let element
    if (this.state.editing) {
      element = (
        <TodoTextInput text={todo.text}
                       editing={this.state.editing}
                       />
      )
    } else {
      element = (
        <div className="view">
          <input className="toggle"
                 type="checkbox"
                 checked={todo.done}
                 onChange={()=>actions.done(todo.id)} />
          <label onDoubleClick={()=> this.setState({editing:true})}>
            {todo.text}
          </label>
          <button className="destroy"
                  onClick={() => actions.remove(todo.id)} />
        </div>
      )
    }

    return (
      <li className={classnames({
        completed: todo.done,
        editing: this.state.editing
      })}>
        {element}
      </li>
    )
  }
}

export default TodoItem
