import * as React from 'react';
import { render } from 'react-dom';
import X, { x } from 'xreact'
import * as rx from 'xreact/lib/xs/rx'
import * as when from 'when'
import {just, fromPromise} from 'most'
import {compose, lensProp, over, set, identity} from 'ramda'
import * as Type from 'union-type'
const Intent = Type({
  Inc: [Number],
  Dec: [Number],
  Double: [],
  Half: []
})

const CounterView = props => (
  <div>
    <button onClick={()=>props.actions.half()}>/2</button>
    <button onClick={()=>props.actions.dec(1)}>-1</button>
    <span>{props.count}</span>
    <button onClick={()=>props.actions.inc(1)}>+1</button>
    <button onClick={()=>props.actions.double()}>*2</button>
  </div>
)

CounterView.defaultProps = { count: 0 };

const lensCount = lensProp('count')

const asyncInitCount11 = x(intent$=>{
  return {
    update$: just(11)
      .flatMap(compose(fromPromise, when))
      .map(set(lensCount))
  }
})

const doublable = x(intent$ => {
  return {
    update$: intent$.map(Intent.case({
      Double: () => over(lensCount, x=>x*2),
      Half: () => over(lensCount, x=>x/2),
      _: () => identity
    })),
    actions: {
      double: ()=>Intent.Double,
      half: ()=>Intent.Half,
    }
  }
})

const increasable = x(intent$ => {
  return {
    update$: intent$.map(Intent.case({
      Inc: (v) => over(lensCount, x=>x+v),
      Dec: (v) => over(lensCount, x=>x-v),
      _: () => identity
    })),
    actions: {
      inc: Intent.Inc,
      dec: Intent.Dec,
    }
  }
})

const wrapper = compose(asyncInitCount11, doublable, increasable)
const Counter = wrapper(CounterView)

render(
  <X x={rx}>
    <Counter />
  </X>
  , document.getElementById('app'));
