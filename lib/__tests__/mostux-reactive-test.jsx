jest.dontMock('../mostux.js');
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import uuid from 'uuid';
import most from 'most';
let {default: Mostux} = require('../mostux');
let {connect} = require('../mostux');

describe('mostux', () => {
  describe('todo reactive', ()=>{
    let todolist;
    let Todo = React.createClass({
      render(){
        return <div className={'todo-'+this.props.todo.id} key={this.props.todo.id} data-complete={this.props.todo.done}>{this.props.todo.text}</div>
      }
    });
    let Buttons = React.createClass({
      render(){
        return (
          <div>
            <button className="btn-complete" onClick={e=>this.props.actions.done(e,1)} >complete</button>
            <button className="btn-delete" onClick={e=>this.props.actions.remove(e,2)}>delete</button>
          </div>)
      }
    });

    let TodoList = React.createClass({
      getInitialState(){
        return {
          todos: [
            {id:1, text:'hehe', done:false},
            {id:2, text:'heheda', done:false},
          ]
        }
      },
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
            <Buttons actions={this.props.actions} />
        </div>
      }
    });

    let RxTodoList = connect(TodoList, function(state$, intent$){
      let done$ = intent$.filter(x=>x.type=='done');
      let delete$ = intent$.filter(x=>x.type=='remove');
      let newTodos = state$
                          .combine(({todos}, done)=>{
                            debugger
                            return {todos:todos.map(todo=>{
                              if(todo.id==done.id){
                                todo.done =! todo.done;
                                return todo;
                              }
                              return todo;
                            })}
                          }, done$)
                          .combine(({todos}, deleted)=>{
                            return {todos:todos.filter(todo=>todo.id!=deleted.id)}
                          }, delete$)
                          .startWith({
                            todos: [
                              {id:1, text:'hehe', done:false},
                              {id:2, text:'heheda', done:false},
                            ]
                          })
        return {
          done: (event, id)=>({type:'done', id, event}),
          remove: (event, id)=>({type:'remove', id, event}),
          state$: newTodos,
        }
    });
    beforeEach(()=>{
      todolist = TestUtils.renderIntoDocument(
        <Mostux>
          <RxTodoList />
        </Mostux>
      )
    });

    it('click complete buttom will complete', () => {
      jest.runAllTimers();
      expect(TestUtils.scryRenderedComponentsWithType(todolist, Todo)[0].props.todo.done).toBe(false);
      TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithClass(todolist, 'btn-complete'));
      jest.runAllTimers();
      expect(TestUtils.scryRenderedComponentsWithType(todolist, Todo)[0].props.todo.done).toBe(true);
      TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithClass(todolist, 'btn-delete'));
      jest.runAllTimers();
      expect(TestUtils.scryRenderedComponentsWithType(todolist, Todo).length).toBe(1);
    });
  });
})
