import React from 'react'
import classnames from 'classnames'
import MainSection from './MainSection'
const FILTER_TITLES = {
  'SHOW_ALL': 'All',
  'SHOW_ACTIVE': 'Active',
  'SHOW_COMPLETED': 'Completed'
}

const FILTER_FUNC = {
  'SHOW_ALL': _=>_,
  'SHOW_ACTIVE': todos=>todos.filter(todo=>!todo.done),
  'SHOW_COMPLETED': todos=>todos.filter(todo=>todo.done),
}
let Footer = React.createClass({
  renderTodoCount() {
    const { activeCount } = this.props
    const itemWord = activeCount === 1 ? 'item' : 'items'

    return (
      <span className="todo-count">
        <strong>{activeCount || 'No'}</strong> {itemWord} left
      </span>
    )
  },

  renderFilterLink(filter) {
    const title = FILTER_TITLES[filter]
    const { filter: selectedFilter, onShow, actions } = this.props
    return (
      <a className={classnames({ selected: filter === selectedFilter })}
         style={{ cursor: 'pointer' }}
         onClick={() => actions.filterWith(FILTER_FUNC[filter])}>
        {title}
      </a>
    )
  },

  renderClearButton() {
    const { completedCount, actions } = this.props
    if (completedCount > 0) {
      return (
        <button className="clear-completed"
                onClick={actions.clear} >
          Clear completed
        </button>
      )
    }
  },

  render() {
    return (
      <footer className="footer">
        {this.renderTodoCount()}
        <ul className="filters">
        {['SHOW_ALL', 'SHOW_ACTIVE', 'SHOW_COMPLETED' ].map(filter =>
            <li key={filter}>
              {this.renderFilterLink(filter)}
            </li>
          )}
        </ul>
        {this.renderClearButton()}
      </footer>
    )
  },
});


export default Footer
