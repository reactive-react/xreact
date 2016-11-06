import React from 'react'
import TodoItem from './TodoItem'
import Footer from './Footer'
import {connect} from 'react-most'
import rest from 'rest'
const remote = 'todos.json';
import _ from 'lodash'
import * as most from 'most'
import Intent from '../todo.action'
const id = _=>_
const anyToId = ()=>id

const MainSection = ({todos,filter}) => {
  if(!todos||!filter) return <section className="main"/>
  const completedCount = todos.reduce((count, todo) => todo.done ? count + 1 : count, 0);

  const filteredTodos = filter(todos);
  return (
  <section className="main">
    <ul className="todo-list">
      {filteredTodos.map(todo =>
        <TodoItem key={todo.id} todo={todo} />
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
  let editSink$ = intent$.map(Intent.case({
    Edit: todo => state => ({
      todos: state.todos.map(oldtodo=>todo.id==oldtodo.id?todo:oldtodo)
    }),
    _:anyToId
  }));
  let dataSink$ = most.fromPromise(rest(remote))
                      .map(x=>JSON.parse(x.entity))
                      .map(data=>()=>({todos: data}));

  let clearSink$ = intent$.map(Intent.case({
    Clear: () => state=>({
      todos: state.todos.filter(todo=>{
        return !todo.completed
      })
    }),
    _: anyToId
  }))

  /* let searchSource$ = intent$.filter(i=>i.type=='search').debounce(500).map(x=>x.text.trim());

   * let blankSearchSink$ = searchSource$.filter(search=>!search).map(_=>_=>({filter:_.identity}));
   * let searchSink$ = searchSource$.filter(search=>!!search).map(search=>state=>({
   *   filter: x=>x.filter(todo=>{
   *     return !!search.toLowerCase().split(' ').filter((word)=>{
   *       return !!todo.text.toLowerCase().split(' ').filter(w=>w==word).length
   *     }).length
   *   })}));

   * let filterSink$ = intent$.filter(x=>x.type=='filter').map(intent=>state=>({
   *   filter: intent.filter
   * }));*/
  return {
    editSink$,
    dataSink$,
    clearSink$,
  }
})(MainSection)
