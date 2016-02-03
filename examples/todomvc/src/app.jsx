import React, { Component, PropTypes } from 'react';
import Header from './components/Header';
import MainSection from './components/MainSection';
import {render} from 'react-dom';
import most from 'most';
import Most from '../../../lib/react-most'
import {connect} from '../../../lib/react-most'
import rest from 'rest'
import {addTodo,deleteTodo,completeTodo} from './todo.action'
import _ from 'lodash'
const remote = '/todos.json';
const id = _=>_;
const log = _=>console.log(_)
const App = (props) => {
  return (
    <div>
      <Header actions={props.actions} />
      <MainSection {...props} />
    </div>
  )
}

let RxApp = connect(function(intent$){
  let search$ = intent$.filter(x=>x.type=='search');
  let defaultState$ = most.of(()=>({
    todos: [
      {id:0, text:'Loading...dadada', done:false},
    ],
    filter: id,
  }));

  let dataSink$ = most.fromPromise(rest(remote))
                              .map(x=>JSON.parse(x.entity))
                              .map(data=>_=>({todos: data}));

  let searchSource$ = search$.debounce(500).map(x=>x.text.trim());

  let blankSearchSink$ = searchSource$.filter(search=>!search).map(_=>_=>({filter:id}));
  let searchSink$ = searchSource$.filter(search=>!!search).map(search=>state=>({
      filter: x=>x.filter(todo=>{
        return !!search.toLowerCase().split(' ').filter((word)=>{
          return !!todo.text.toLowerCase().split(' ').filter(w=>w==word).length
        }).length
      })}));

  let clearSink$ = intent$.filter(x=>x.type=='clear').map(_=>state=>({
    todos: state.todos.filter(todo=>!todo.done)
  }));

  let editSink$ = intent$.filter(x=>x.type=='edit').map(({todo})=>state=>({
    todos: state.todos.map(oldtodo=>todo.id==oldtodo.id?todo:oldtodo)
  }));

  let filterSink$ = intent$.filter(x=>x.type=='filter').map(intent=>state=>({
    filter: intent.filter
  }));
  return _.assign({
    search: (text)=>({type:'search', text}),
    unfocus: ()=>({type:'unfocus'}),
    clear: ()=>({type:'clear'}),
    filterWith: filter=>({type:'filter', filter}),
    edit: todo=>({type:'edit', todo}),
    editSink$,
    defaultState$,
    dataSink$,
    searchSink$,
    blankSearchSink$,
    clearSink$,
    filterSink$,
  }, addTodo(intent$), deleteTodo(intent$), completeTodo(intent$))
})(App);

render(
  <Most>
    <RxApp/>
  </Most>
  , document.getElementById('app'));
