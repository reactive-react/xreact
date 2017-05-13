import React from 'react';
import { render } from 'react-dom';
import Most, { connect } from 'react-most'

const CounterView = props => (
  <div>
    <button onClick={props.actions.dec}>-</button>
    <span>{props.count}</span>
    <button onClick={props.actions.inc}>+</button>
    <button onClick={props.actions.exception}>error</button>
  </div>
)
CounterView.defaultProps = { count: 0 };

const counterable = connect((intent$) => {
  return {
    update$: intent$.map(intent => {
      switch (intent.type) {
        case 'inc':
          return state => ({ count: state.count + 1 });
        case 'dec':
          return state => ({ count: state.count - 1 });
        case 'exception':
          throw new Error('exception')
        default:
          return _ => _;
      }
    }),
    actions:{
      inc: () => ({ type: 'inc' }),
      dec: () => ({ type: 'dec' }),
      exception:() => ({type: 'exception'})
    }
  }
})

const Counter = counterable(CounterView)

render(
  <Most>
    <Counter />
  </Most>
  , document.getElementById('app'));
