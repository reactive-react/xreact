import React from 'react'
import TodoItem from './TodoItem'
import Footer from './Footer'
import {connect} from 'react-most'
import rest from 'rest'
const remote = 'todos.json';
import * as most from 'most'
import Intent from '../todo.action'
import r from 'ramda'
const alwaysId = ()=>r.identity

const MainSection = ({todos,filter}) => {
  const completedCount = todos.reduce((count, todo) => todo.done ? count + 1 : count, 0);
  const filteredTodos = filter(todos);
  return (
    <section className="main">
      <ul className="todo-list">
        {filteredTodos.map((todo,index) =>
          <TodoItem key={todo.id} index={index} todo={todo} />
         )}
      </ul>
      <Footer completedCount={completedCount} activeCount={todos.length-completedCount} />
    </section>
  )
}

MainSection.defaultProps = {
  todos: [
    {id:0, text:'Loading...dadada', done:false},
  ],
  filter: _=>_
}

export default connect((intent$)=>{
  let lensTodos = r.lensProp('todos')
  let lensComplete = r.lensProp('done')
  let lensTodo = index => r.compose(lensTodos, r.lensIndex(index))
  let lensTodoComplete = index => r.compose(lensTodo(index), lensComplete)
  let nextId = r.compose(r.inc, r.prop('id'), r.last, r.sortBy(r.prop('id')))
  let sinks$ = intent$.map(Intent.case({
    Add: (todo) => state=>{
      return r.over(lensTodos, r.append(r.assoc('id', nextId(state.todos), todo)), state)
    },
    Edit: (todo,index) => r.set(lensTodo(index), todo),
    Clear: () => r.over(lensTodos, r.filter(todo=>!todo.done)),
    Delete: id => r.over(lensTodos, r.filter(todo=>todo.id!=id)),
    Filter: filter=>state=>({ filter }),
    Done: index=>r.over(lensTodoComplete(index), r.not),
    _: alwaysId
  }))
  let data$ = most.fromPromise(rest(remote))
                  .map(x=>JSON.parse(x.entity))
                  .map(data=>()=>({todos: data}));

  let searchSink$ = intent$
    .filter(Intent.case({
      Search: x=>!!x,
      _:()=>false
    }))
    .debounce(500)
    .map(Intent.case({
      Search: x=>x.text.trim()
    }))
    .map(search=>state=>({
      filter: x=>x.filter(todo=>{
        return !!search.toLowerCase().split(' ').filter((word)=>{
          return !!todo.text.toLowerCase().split(' ').filter(w=>w==word).length
        }).length
      })
    }))

  return {
    sinks$,
    /* searchSink$,*/
    data$,
  }
})(MainSection)
