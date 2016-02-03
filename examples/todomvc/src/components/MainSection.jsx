import React, { Component, PropTypes } from 'react'
import TodoItem from './TodoItem'
import Footer from './Footer'
import {connect} from '../../../../lib/react-most'

import _ from 'lodash'
import most from 'most'
let MainSection = (props) => {
  const {todos,filter} = props
  if(!todos||!filter) return <section className="main"/>
  const completedCount = todos.reduce((count, todo) =>
  todo.done ? count + 1 : count, 0);

  const filteredTodos = filter(todos);
  return (
  <section className="main">
    <ul className="todo-list">
      {filteredTodos.map(todo =>
        <TodoItem key={todo.id} todo={todo} {...props} />
       )}
    </ul>
    <Footer completedCount={completedCount} activeCount={todos.length-completedCount} {...props}/>
  </section>
  )
}

export default connect((intent$)=>{
  let searchSource$ = intent$.filter(i=>i.type=='search').debounce(500).map(x=>x.text.trim());

  let blankSearchSink$ = searchSource$.filter(search=>!search).map(_=>_=>({filter:_.identity}));
  let searchSink$ = searchSource$.filter(search=>!!search).map(search=>state=>({
    filter: x=>x.filter(todo=>{
      return !!search.toLowerCase().split(' ').filter((word)=>{
        return !!todo.text.toLowerCase().split(' ').filter(w=>w==word).length
      }).length
    })}));

  let filterSink$ = intent$.filter(x=>x.type=='filter').map(intent=>state=>({
    filter: intent.filter
  }));
  return {
    searchSink$,
    blankSearchSink$,
    filterSink$,
  }
})(MainSection)
