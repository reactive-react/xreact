import * as React from 'react'
import TodoItem from './TodoItem'
import Footer from './Footer'
import { x } from 'xreact/lib/x'
import * as Most from 'xreact/lib/xs/most'
import { Subject } from 'most-subject'
import { Stream } from 'most'
import { Intent } from '../intent'
import * as r from 'ramda'
const alwaysId = () => r.identity
import * as most from 'most'
interface Todo {
  id: number
  text: string
  done: boolean
}
interface MainSectionProps {
  todos: Todo[]
  filter: (todos: Todo[]) => Todo[]
}
const MainSection: React.StatelessComponent<MainSectionProps> = ({ todos, filter }) => {
  const completedCount = todos.reduce((count, todo) => todo.done ? count + 1 : count, 0);
  const filteredTodos = filter(todos);
  return (
    <section className="main">
      <input className="toggle-all" type="checkbox" />
      <label htmlFor="toggle-all">Mark all as complete</label>
      <ul className="todo-list">
        {filteredTodos.map((todo, index) =>
          <TodoItem key={todo.id} index={index} todo={todo} />
        )}
      </ul>
      <Footer completedCount={completedCount} activeCount={todos.length - completedCount} />
    </section>
  )
}

MainSection.defaultProps = {
  todos: [],
  filter: (_: Todo[]) => _
}

export default x<Most.URI, Intent<Todo>, MainSectionProps>((intent$) => {
  let lensTodos = r.lensProp('todos')
  let lensComplete = r.lensProp('done')
  let lensTodo = (index: number) =>
    r.compose(lensTodos, r.lensIndex(index))
  let lensTodoComplete = (index: number) =>
    r.compose(lensTodo(index), lensComplete)
  let nextId = r.compose(r.last,
    r.map((x: Todo) => x.id + 1),
    r.sortBy(r.prop('id')))
  let update$ = intent$.map((intent: Intent<Todo>) => {
    switch (intent.kind) {
      case ('add'):
        return (state: MainSectionProps) => {
          let nextid = nextId(state.todos) || 0
          return r.over(lensTodos, r.append(r.assoc('id', nextid, intent.value)), state)
        }
      case 'edit':
        return r.set(lensTodo(intent.todo.id), intent.todo)
      case 'clear':
        return r.over(lensTodos, r.filter((todo: Todo) => !todo.done))
      case 'delete':
        return r.over(lensTodos, r.filter((todo: Todo) => todo.id != intent.id))
      case 'filter':
        return (state: MainSectionProps) => ({ filter: intent.filter })
      case 'done':
        return r.over(lensTodoComplete(intent.index), r.not)
      default:
        return (state: MainSectionProps) => state
    }
  })

  let data$ = most.fromPromise(Promise.resolve(require('../todos.json')))
    .map(state => () => state)

  return {
    update$: update$.merge(data$),
  }
})(MainSection)
