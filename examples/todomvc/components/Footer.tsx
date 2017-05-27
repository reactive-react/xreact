import * as React from 'react'
import * as classnames from 'classnames'
import MainSection from './MainSection'
import * as Intent from '../intent'
import { x } from 'xreact/lib/x'
import * as StaticStream from 'xreact/lib/xs'
import * as Most from 'xreact/lib/xs/most'
import { Todo } from './interfaces'
import { of } from 'most'
import { identity } from 'ramda'

const FILTER_TITLES = {
  'SHOW_ALL': 'All',
  'SHOW_ACTIVE': 'Active',
  'SHOW_COMPLETED': 'Completed'
}

export const FILTER_FUNC = {
  'SHOW_ALL': identity,
  'SHOW_ACTIVE': (todos: Todo[]) => todos.filter(todo => !todo.done),
  'SHOW_COMPLETED': (todos: Todo[]) => todos.filter(todo => todo.done),
}
const FilterLink = ({ onClick, filter, current }) => {
  return <li>
    <a className={classnames({ selected: filter === current })}
      style={{ cursor: 'pointer' }}
      onClick={onClick}>
      {FILTER_TITLES[filter]}
    </a>
  </li>
}

const TodoCount = ({ activeCount }) => (
  <span className="todo-count">
    <strong>{activeCount || 'No'}</strong>
    {activeCount === 1 ? 'item' : 'items'} left
  </span>
)

const ClearButton = ({ completedCount, actions }) => (
  completedCount > 0 ?
    <button className="clear-completed"
      onClick={actions.clear} >
      Clear completed
    </button> : null
)
const Footer = React.createClass({
  getInitialState() {
    return {
      currentFilter: 'SHOW_ALL'
    }
  },

  render() {
    return (
      <footer className="footer">
        <TodoCount activeCount={this.props.activeCount} />
        <ul className="filters">
          {['SHOW_ALL', 'SHOW_ACTIVE', 'SHOW_COMPLETED'].map(filter =>
            <FilterLink
              key={filter}
              filter={filter}
              current={this.state.currentFilter}
              onClick={() => {
                this.setState({ currentFilter: filter })
                this.props.actions.filterWith(FILTER_FUNC[filter])
              }} />
          )}
        </ul>
        <ClearButton completedCount={this.props.completeCount} actions={this.props.actions} />
      </footer>
    )
  },
});
export default x<Most.URI, Intent.Intent<Todo>, Todo>((intent$) => {
  return {
    update$: of(identity),
    actions: {
      clear: () => ({ kind: 'complete' } as Intent.Complete),
      filterWith: (f) => ({ kind: 'filter', filter: f } as Intent.Filter<Todo>),
    }
  }
})(Footer)
