jest.dontMock('../react-most.js');
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import most from 'most';
let {default: Most, connect} = require('../react-most');

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
            <button className="btn-complete" onClick={e=>this.props.actions.done(1)} >complete</button>
            <button className="btn-remove" onClick={e=>this.props.actions.remove(1)} >add</button>
          </div>)
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
            <Buttons actions={this.props.actions} />
        </div>
      }
    });

    let RxTodoList = connect(TodoList, function(intent$){
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
      })
                               .startWith(()=>({
                                 todos: [
                                   {id:1, text:5, done:false},
                                   {id:2, text:'heheda', done:false},
                                 ]
                               }));
      return {
        done: (id)=>({type:'done', id}),
        remove: (id)=>({type:'remove', id}),
        deleteState$,
        doneState$,
      }
    });
    beforeEach(()=>{
      todolist = TestUtils.renderIntoDocument(
        <Most>
          <RxTodoList />
        </Most>
      )
    });

    it('click complete buttom will complete', () => {
      jest.runAllTimers();
      expect(TestUtils.scryRenderedComponentsWithType(todolist, Todo)[0].props.todo.done).toBe(false);
      TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithClass(todolist, 'btn-complete'));
      jest.runAllTimers();
      expect(TestUtils.scryRenderedComponentsWithType(todolist, Todo)[0].props.todo.done).toBe(true);

    });
    it('click remove button will remove item', ()=> {
      jest.runAllTimers();
      TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithClass(todolist, 'btn-remove'));
      TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithClass(todolist, 'btn-remove'));
      jest.runAllTimers();
      jest.runAllTicks();
      expect(TestUtils.scryRenderedComponentsWithType(todolist, Todo).length).toBe(1);
    });  });
})
