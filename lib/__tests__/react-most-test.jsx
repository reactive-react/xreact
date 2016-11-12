import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import * as most from 'most';
let {default: Most, connect} = require('../react-most');
let {do$, historyStreamOf} = require('../test-utils')

describe('mostux', () => {
  describe('todo reactive', ()=>{
    let todolist;
    let Todo = React.createClass({
      render(){
        return <div className={'todo-'+this.props.todo.id} key={this.props.todo.id} data-complete={this.props.todo.done}>{this.props.todo.text}</div>
      }
    });

    let TodoList = React.createClass({
      render(){
        let {todos} = this.props;
        let todoElements;
        if(todos){
          todoElements = todos.map(todo => {
            return <Todo key={todo.id} todo={todo} />
          });
        }
        return <div>
            {todoElements}
        </div>
      }
    });

    let RxTodoList = connect(function(intent$){
      let default$ = most.of(()=>({
        todos: [
          {id:1, text:5, done:false},
          {id:2, text:'heheda', done:false},
        ]
      }))
      let done$ = intent$.filter(x=>x.type=='done');
      let delete$ = intent$.filter(x=>x.type=='remove');
      let doneState$ = done$.map((done)=>{
        return state=>(
          {
            todos:state.todos.map(todo=>{
              if(todo.id==done.id){
                todo.done =! todo.done;
                return todo;
              }
              return todo;
            })
          }
        )
      });

      let deleteState$ = delete$.map((deleted)=>{
        return state=>(
          {todos: state.todos.filter(todo=>todo.id!=deleted.id)}
        )
      });
      return {
        done: (id)=>({type:'done', id}),
        remove: function remove(id){return {type:'remove', id}},
        default$,
        deleteState$,
        doneState$,
      }
    })(TodoList);

    it('render dump Component TodoList UI correctly', () => {
      let todolist = TestUtils.renderIntoDocument(
        <TodoList todos={[
          {id:1, text:5, done:false},
          {id:2, text:'heheda', done:false},
        ]}/>
      )
      let todos = TestUtils.scryRenderedComponentsWithType(todolist, Todo)
      expect(todos.length).toBe(2);
      expect(todos[0].props.todo.done).toBe(false);
    });

    it('behaviors connected to dump Component works as expected', ()=> {
      let todolist = TestUtils.renderIntoDocument(
        <Most >
          <RxTodoList history={true}>
          </RxTodoList>
        </Most>
      )
      let div = TestUtils.findRenderedComponentWithType(todolist, RxTodoList)

      do$([()=>div.actions.done(1),
           ()=>div.actions.done(2),
           ()=>div.actions.remove(2),
           ()=>div.actions.done(1)])

      return historyStreamOf(div)
        .take$(4)
        .then(state=>
          expect(state.todos).toEqual(
            [
              {id: 1, text: 5, done: false}
            ]))
    });
  });
})
