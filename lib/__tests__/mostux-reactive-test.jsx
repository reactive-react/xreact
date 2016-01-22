jest.dontMock('../mostux.js');
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
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
            <button className="btn-complete" onClick={e=>this.props.actions.done(1)} >complete</button>
            <button className="btn-add" onClick={e=>this.props.actions.add(1)} >add</button>
            <button className="btn-minus" onClick={e=>this.props.actions.minus(1)} >minus</button>
            <button className="btn-delete" onClick={e=>this.props.actions.remove(2)}>delete</button>
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

    let RxTodoList = connect(TodoList, function(prevState$, intent$){
      let done$ = intent$.filter(x=>x.type=='done');
      let delete$ = intent$.filter(x=>x.type=='remove');
      let minus$ = intent$.filter(x=>x.type=='minus');
      let add$ = intent$.filter(x=>x.type=='add')
      let doneState$ = done$.sample((done, {todos})=>{
        return todos.map(todo=>{
          if(todo.id==done.id){
            todo.done =! todo.done;
            return todo;
          }
          return todo;
        });
      }, done$, prevState$)
                            .map(todos=>({todos}));
      let deleteState$ = delete$.sample((deleted,{todos})=>{
        return todos.filter(todo=>todo.id!=deleted.id);
      }, delete$, prevState$)
                               .map(todos=>({todos}))
                               .startWith({
                                 todos: [
                                   {id:1, text:5, done:false},
                                   {id:2, text:'heheda', done:false},
                                 ]
                               });
      let minusState$ = minus$.zip((minus,{todos})=>{
        return todos.map(todo=>{
          if(todo.id==minus.id){
            todo.text--
            return todo
          }
          return todo;
        })
      }, prevState$)
                              .map(todos=>({todos}));;
      let addState$ = add$.zip((add,{todos})=>{
        return todos.map(todo=>{
          if(todo.id==add.id){
            todo.text++
            return todo
          }
          return todo;
        })
      },prevState$)
                          .map(todos=>({todos}));;

      return {
        done: (id)=>({type:'done', id}),
        remove: (id)=>({type:'remove', id}),
        add: (id)=>({type:'add', id}),
        minus: (id)=>({type:'minus', id}),
        deleteState$,
        doneState$,
        addState$,
        minusState$,

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

    });
    it('click remove button will remove item', ()=> {
      jest.runAllTimers();
      TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithClass(todolist, 'btn-delete'));
      TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithClass(todolist, 'btn-delete'));
      jest.runAllTimers();
      jest.runAllTicks();
      expect(TestUtils.scryRenderedComponentsWithType(todolist, Todo).length).toBe(1);
    });
    it('click add and minus', ()=> {
      jest.runAllTimers();
      TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithClass(todolist, 'btn-minus'));
      jest.runAllTimers();
      TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithClass(todolist, 'btn-add'));
      jest.runAllTimers();
      TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithClass(todolist, 'btn-minus'));
      jest.runAllTimers();
      TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithClass(todolist, 'btn-minus'));
      jest.runAllTimers();
      expect(TestUtils.scryRenderedComponentsWithType(todolist, Todo)[0].props.todo.text).toBe(3);
    });
  });
})
