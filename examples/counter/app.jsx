import * as React from 'react';
import { render } from 'react-dom';
import * as RX from '../../lib/xs/rx'
import X, { x } from '../../lib/x'

const CounterView = props => (
  <div>
    <button onClick={props.actions.dec}>-</button>
    <span>{props.count}</span>
    <button onClick={props.actions.inc}>+</button>
  </div>
)
CounterView.defaultProps = { count: 0 };

const counterable = x((intent$) => {
  return {
    update$: intent$.map(intent => {
      switch (intent.type) {
        case 'inc':
          return state => ({ count: state.count + 1 });
        case 'dec':
          return state => ({ count: state.count - 1 });
        default:
          return _ => _;
      }
    }),
    actions: {
      inc: () => ({ type: 'inc' }),
      dec: () => ({ type: 'dec' }),
    }
  }
})

const Counter = counterable(CounterView)

render(
  <X x={RX}>
    <Counter />
  </X>
  , document.getElementById('app'));
