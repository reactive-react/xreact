import * as React from 'react'
import { connect } from 'react-most'
import TodoTextInput from './TodoTextInput'

const id = _ => _;
let Header = (props) => {
    return (
        <header className="header">
            <h1>todos</h1>
            <TodoTextInput newTodo={true}
                placeholder="What needs to be done?"
            />
        </header>
    )
}

export default Header
