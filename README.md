# -⚛-> React Most

[![Join the chat at https://gitter.im/jcouyang/react-most](https://badges.gitter.im/jcouyang/react-most.svg)](https://gitter.im/jcouyang/react-most?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A Monadic Reactive Composable State Wrapper for React Component

[![CircleCI](https://circleci.com/gh/reactive-react/react-most.svg?style=svg)](https://circleci.com/gh/reactive-react/react-most)
[![codecov](https://codecov.io/gh/reactive-react/react-most/branch/master/graph/badge.svg)](https://codecov.io/gh/reactive-react/react-most)
[![npm](https://img.shields.io/npm/dm/react-most.svg?maxAge=2592000)](https://www.npmjs.com/package/react-most)
[![npm](https://img.shields.io/npm/v/react-most.svg?maxAge=2592000)]()

## Install
```
npm install react-most --save
```

## What
`react-most` is simple and only 100 LOC React Higher Order Component. only depends on most and react.

data flow is simple and one way only
![](https://raw.githubusercontent.com/jcouyang/react-most/master/docs/images/flow.dot.png)

## Terminology
- **Action**: a action can create a Intent and send to `Intent Stream`
- **Intent Stream**: a time line of all kinds of `Intent` created by `Action`
- **Sink** a time line of transforms of state e.g.`--- currentState => nextState --->`
- **State** simply a react component state

## Quick Start

sorry we don't have a **book** to document how to use `react-most`, and I don't really need to, but
there's only 3 things you should notice when using `react-most`, I'll explain by a simple counter app.

also you can refer to various of [Examples](https://github.com/reactive-react/react-most/wiki/examples.md) and it's simple [API](https://github.com/reactive-react/react-most/wiki/api.md)

### 1. Create a simple statless component
```html
const CounterView = props => (
	<div>
		<button onClick={props.actions.dec}>-</button>
		<span>{props.count}</span>
		<button onClick={props.actions.inc}>+</button>
	</div>
)
```
### 2. Define Counter's Behaviour
1. a counter can have actions of `inc` and `dec`, which will send a objec `{type: 'inc'}` or `{type:'dec'}` to `Intent Stream` if it's been call
2. a counter reactivly generate state transform function when recieve intent of type `inc` or `dec`.
```js
const counterable = connect(intent$ => {
	return {
    actions: {
      inc: () => ({ type: 'inc' }),
		  dec: () => ({ type: 'dec' }),
    },
		sink$: intent$.map(intent => {
			switch (intent.type) {
				case 'inc':
					return state => ({ count: state.count + 1 });
				case 'dec':
					return state => ({ count: state.count - 1 });
				default:
					return _ => _;
			}
		}),
	}
})
```
### 3. connect behaviour and view

```js
const Counter = counterable(CounterView)

render(
	<Most>
		<Counter />
	</Most>
	, document.getElementById('app'));
```

## Features

Redux is awesome, but if you're big fan of Functional Reactive Programming, you would've imaged all user events, actions and data are Streams, then we can map,filter, compose, join on those streams to React state.

### Pure Functional, Declarative & Monadic
finstead of imperative describe what you want to do with data at certain step, we simple define data transforms and compose them to data flow. No variable, no state, no side effort at all while you composing data flow.

### Composable and Reusable Sinks
sinks are composable and reusable, not like reducer in redux, where switch statement are hard to break and compose.

also wrappers are simply function that you can easily compose
```js
const countBy1 = connect(...)
const countBy2 = connect(...)
const Counter = countBy1(countBy2(CounterView))
// or
const counterable = compose(counterBy1, counterBy2)
const Counter = counterable(CounterView)
```

### Easy to Test, no mocks
since UI and UI behaviour are loose couple, you can simply define a dump react component and test it by passing data. seperatly you can test behaviour by given actions, and verify it's state.

```js
let {do$, historyStreamOf} = require('../test-utils')
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
    expect(state).toEqual({todos: [{id: 1, text: 5, done: false}]}))
```

### Async actions
when function is not async such as promise, simply convert it to Stream and flatMap it
```js
intent$.map(promise=>most.fromPromise)
	.flatMap(value=>dosomething)
```

### Transducers support
[transducer](https://github.com/cognitect-labs/transducers-js) is another high perfomance functional way to compose data flow other than monadic.

writing actions in transducers improve reusablity.

### Time Travel
since we have all action's Stream, we can easyliy reproduce all the action anytime, or get snapshot of state stream and going back in time.

you can pass history as 3rd parameter of `connect`
```js
connect(intent$=>[awesome flow], {history:true})(App)
```

connect will populate history stream with all state history

then you get a create action to deal with historyStream.

### Modular and Easy to Extend
if you're from Rx.js, it's easy to switch rx engine into react-most, by simply pass a props named `engine` to `Most` component

```html
import rxEngine from 'react-most/engine/rx'
<Most engine={rxEngine}>
  <App />
</Most>
```

## [More Documents...](https://github.com/jcouyang/react-most/wiki)


## Thanks to...
- [most](https://github.com/cujojs/most)
- [React](http://facebook.github.io/react/)
- [redux](https://github.com/rackt/redux)
- [Om](https://github.com/omcljs/om)
- [Cycle](http://cycle.js.org/)
- [transdux](https://github.com/jcouyang/transdux)
