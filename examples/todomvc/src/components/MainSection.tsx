import * as React from 'react'
import TodoItem from './TodoItem'
import Footer from './Footer'
import { connect } from 'react-most'
import rest from 'rest'
const remote = 'todos.json';
import { Subject } from 'most-subject'
import {Stream} from 'most'
import { Intent } from '../intent'
import * as r from 'ramda'
const alwaysId = () => r.identity

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

export default connect((intent$) => {
    let lensTodos = r.lensProp('todos')
    let lensComplete = r.lensProp('done')
    let lensTodo = (index: number) => r.compose(lensTodos, r.lensIndex(index))
    let lensTodoComplete = (index: number) => r.compose(lensTodo(index), lensComplete)
    let nextId: (todos: Todo[]) => number = r.compose(r.last, r.map((x: Todo) => x.id + 1), r.sortBy(r.prop('id')))
    let update$:Stream<(state: MainSectionProps) => MainSectionProps> = intent$.map((intent:Intent<Todo>) => {
        // switch (intent.kind) {
        //     case ('add'):
        //         return (state: MainSectionProps) => {
        //             return r.over(lensTodos, r.append(r.assoc('id', nextId(state.todos) || 0, intent.todo)), state)
        //         }
        //     default:
                return (state: MainSectionProps) => state
        // }
    })

    // Intent.case({
    //     Add: ,
    //     Edit: (todo: Todo, index: number) => r.set(lensTodo(index), todo),
    //     Clear: () => r.over(lensTodos, r.filter((todo: Todo) => !todo.done)),
    //     Delete: (id: number) => r.over(lensTodos, r.filter((todo: Todo) => todo.id != id)),
    //     Filter: (filter: (todos: Todo[]) => Todo[]) => (state: MainSectionProps) => ({ filter }),
    //     Done: (index: number) => r.over(lensTodoComplete(index), r.not),
    //     _: alwaysId
    // }))
    // let data$ = most.fromPromise(rest(remote))
    //     .map(x => JSON.parse(x.entity))
    //     .map(data => () => ({ todos: data }));

    return {
        update$: update$,
        actions:{}
    }
})(MainSection)
