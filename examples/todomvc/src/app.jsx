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
const remote = 'todos.json';
const log = _=>console.log(_)
const App = (props) => {
  return (
    <div>
      <Header />
      <MainSection {...props} todos={props.todos}/>
    </div>
  )
}

let RxApp = connect(function(intent$){
  let defaultState$ = most.of(()=>({
    todos: [
      {id:0, text:'Loading...dadada', done:false},
    ],
    filter: _.identity,
  }));
  let dataSink$ = most.fromPromise(rest(remote))
                      .map(x=>JSON.parse(x.entity))
                      .map(data=>_=>({todos: data}));
  let clearSink$ = intent$.filter(x=>x.type=='clear').map(_=>state=>({
    todos: state.todos.filter(todo=>!todo.done)
  }));

  let editSink$ = intent$.filter(x=>x.type=='edit').map(({todo})=>state=>{
    return {
      todos: state.todos.map(oldtodo=>todo.id==oldtodo.id?todo:oldtodo)
    }
  });

  return {
    editSink$,
    defaultState$,
    dataSink$,
    clearSink$,
    addSink$: addTodo(intent$),
    deleteSink$: deleteTodo(intent$),
    doneSink$: completeTodo(intent$),
  }
})(App);

render(
  <Most>
    <RxApp/>
  </Most>
  , document.getElementById('app'));
