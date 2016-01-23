import React, { Component, PropTypes } from 'react';
import Header from './components/Header';
import MainSection from './components/MainSection';
import {render} from 'react-dom';
import most from 'most';
import Most from '../../../lib/react-most'
import {connect} from '../../../lib/react-most'
import rest from 'rest'
import {addTodo,deleteTodo,completeTodo} from './todo.action'
import * as _ from 'lodash'
const remote = 'https://gist.githubusercontent.com/jcouyang/84cac9fc3c6c6397207e/raw/7d2daa2d2daa902923b32e7d2a25cbfc1ce91c36/todos.json';
const id =_=>_;
class App extends Component {
  render(){
    return (
      <div>
          <Header actions={this.props.actions} />
          <MainSection {...this.props} />
      </div>
    )
  }
}

let RxApp = connect(App, function(intent$){
  let search$ = intent$.filter(x=>x.type=='search');
  let defaultState$ = most.never().startWith({
    todos: [
      {id:0, text:'Loading...dadada', done:false},
    ],
    filter: id,
  }).map(defaultState=>(_=>defaultState));

  let dataSink$ = most.fromPromise(rest(remote))
                              .map(x=>JSON.parse(x.entity))
                              .map(data=>_=>({todos: data}));

  let searchSource$ = search$.debounce(500);

  let blankSearchSink$ = searchSource$.filter(search=>!search.text).map(_=>_=>({filter:id}));
  let searchSink$ = searchSource$.filter(search=>!!search.text).map(search=>(
    state=>({
      filter: _=>_.filter(todo=>{
        return !!search.text.toLowerCase().split(' ').filter((word)=>{
          return !!todo.text.toLowerCase().split(' ').filter(w=>w==word).length
        }).length
      })})))

  return _.assign({
    search: (text)=>({type:'search', text}),
    unfocus: ()=>({type:'unfocus'}),
    defaultState$,
    dataSink$,
    searchSink$,
    blankSearchSink$,
  }, addTodo(intent$), deleteTodo(intent$), completeTodo(intent$))
});

render(
  <Most>
    <RxApp/>
  </Most>
  , document.getElementById('app'));
