jest.dontMock('../transdux.js');
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import uuid from 'uuid';

const {default:Transdux, TxMixin} = require('../transdux');

describe('transdux', () => {
  describe('todo dispatch', ()=>{
    let todolist;
    let Todo = React.createClass({
      render(){
        return <div className={'todo-'+this.props.todo.id} key={this.props.todo.id} data-complete={this.props.todo.done}>{this.props.todo.text}</div>
      }
    });
    let TodoList = React.createClass({
      mixins: [TxMixin],
      getInitialState(){
        return {
          todos: [
            {id:1, text:'hehe', done:false},
            {id:2, text:'heheda', done:false},
          ]
        }
      },
      componentDidMount(){
        this.bindActions({
          complete(msg, state){
            return {
              todos: state.todos.map(todo => {
                if(todo.id == msg){
                  todo.done =! todo.done
                }
                return todo
              })
            }
          }
        })
        },
        render(){
          let todos = this.state.todos.map(todo => {
            return <Todo todo={todo} />
          });
          return <div>{todos}</div>
        }
      });
      let Buttons = React.createClass({
        mixins: [TxMixin],
        render(){
          return (
            <div>
                <button className="btn-complete" onClick={_=>this.dispatch(TodoList, 'complete', 1)} >complete</button>
                <button className="btn-change-color" onClick={_=>this.dispatch(Todo, 'colorChange',"red")}>color change</button>
            </div>)
        }
      });

      beforeEach(()=>{
        todolist = TestUtils.renderIntoDocument(
          <Transdux>
            <TodoList />
            <Buttons />
          </Transdux>
        )
      });

      it('click complete buttom will complete', () => {
        expect(TestUtils.scryRenderedComponentsWithType(todolist, Todo)[0].props.todo.done).toBe(false);
        TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithClass(todolist, 'btn-complete'));
        jest.runAllTimers();
        expect(TestUtils.scryRenderedComponentsWithType(todolist, Todo)[0].props.todo.done).toBe(true);
      });
    })
  });
