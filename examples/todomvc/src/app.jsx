import React, { Component, PropTypes } from 'react';
import Header from './components/Header';
import MainSection from './components/MainSection';
import {render} from 'react-dom';
import most from 'most';
import Most from '../../../lib/react-most'
import {connect} from '../../../lib/react-most'
import rest from 'rest'
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
  let done$ = intent$.filter(x=>x.type=='done');
  let delete$ = intent$.filter(x=>x.type=='remove');
  let search$ = intent$.filter(x=>x.type=='search');
  let defaultState$ = most.never().startWith({
    todos: [
      {id:0, text:'Loading...dadada', done:false},
    ],
    filter: id,
  }).map(defaultState=>(_=>defaultState));

  let doneSink$ = done$
    .map(intent=>(
      state=>({
        todos: state.todos.map(todo=>{
          if(todo.id==intent.id){
            todo.done =! todo.done;
            return todo;
          }
          return todo;
        })
      })));

  let deleteSink$ = delete$
      .map(intent=>(
        state=>({
          todos:state.todos.filter(todo=>todo.id!=intent.id)
        })
      ));

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
      })})
  ))

  return {
    done: (id)=>({type:'done', id}),
    remove: (id)=>({type:'remove', id}),
    search: (text)=>({type:'search', text}),
    unfocus: ()=>({type:'unfocus'}),
    defaultState$,
    doneSink$,
    deleteSink$,
    dataSink$,
    searchSink$,
    blankSearchSink$,
  }
});

render(
  <Most>
    <RxApp/>
  </Most>
  , document.getElementById('app'));
