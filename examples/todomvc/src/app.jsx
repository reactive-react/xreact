import React, { Component, PropTypes } from 'react';
import Header from './components/Header';
import MainSection from './components/MainSection';
import {render} from 'react-dom';
import Mostux from 'mostux'
import {connect} from 'mostux'
class App extends Component {
  render(){
    let {done} = this.props.actions
    return (
      <div>
          <Header />
          <MainSection actions={done} {...this.props}/>
      </div>
    )
  }
}

let RxApp = connect(App, function(prevState$, intent$){
  let done$ = intent$.filter(x=>x.type=='done');
  let doneState$ = done$.sample((done, {todos})=>{
      return todos.map(todo=>{
        if(todo.id==done.id){
          todo.done =! todo.done;
          return todo;
        }
        return todo;
      });
    }, done$, prevState$)
                        .map(todos=>({todos}))
                        .startWith({
                          todos: [
                            {id:1, text:5, done:false},
                            {id:2, text:'heheda', done:false},
                          ]
                        });
  return {
    done: (id)=>({type:'done', id}),
    doneState$,
  }
});

render(
  <Mostux>
      <RxApp/>
  </Mostux>
  , document.getElementById('app'));
