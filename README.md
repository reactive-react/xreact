# -:atom_symbol:-> React Most

[![Join the chat at https://gitter.im/jcouyang/react-most](https://badges.gitter.im/jcouyang/react-most.svg)](https://gitter.im/jcouyang/react-most?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A Monadic Reactive Composable State Wrapper for React Components

[![CircleCI](https://circleci.com/gh/reactive-react/react-most.svg?style=svg)](https://circleci.com/gh/reactive-react/react-most)
[![codecov](https://codecov.io/gh/reactive-react/react-most/branch/master/graph/badge.svg)](https://codecov.io/gh/reactive-react/react-most)
[![npm](https://img.shields.io/npm/dm/react-most.svg)](https://www.npmjs.com/package/react-most)
[![npm](https://img.shields.io/npm/v/react-most.svg)](https://www.npmjs.com/package/react-most)
[![greenkeeper.io](https://badges.greenkeeper.io/reactive-react/react-most.svg)](https://greenkeeper.io)

[中文 :cn:](https://github.com/reactive-react/react-most/wiki/%E6%95%99%E7%A8%8B)
## Install
### npm
```
npm install react-most --save
```
### browser
```html
<script src="https://cdn.rawgit.com/reactive-react/react-most/master/dist/vendor.js"></script>
<!-- vendor.js includes react, most, most-subject -->
<script src="https://cdn.rawgit.com/reactive-react/react-most/master/dist/react-most.js"></script>
```

then you can use `Most.default` and `Most.connect`

## What
`react-most` is a simple, 100 LOC Higher Order Component for React. Its only dependencies are [most](https://github.com/cujojs/most), [most-subject](https://github.com/mostjs-community/subject), [React](https://github.com/facebook/react), and (optionally, if you prefered) [RxJS](https://github.com/Reactive-Extensions/RxJS).

Data flow in `react-most` is simple and unidirectional.

![](https://github.com/reactive-react/react-most/wiki/images/react-most-flow.png)

## Terminology
- **Action**: an `Action` can create an `Intent` and send it to the `Intent Stream`
- **Intent Stream**: a timeline of every `Intent` created by every `Action`
- **Sink**: a timeline of transformations of state, e.g.

        --- (currentState => nextState) -- (currentState => nextState) --->
- **State**: a React component's state

## Quick Start
sorry we don't have a **book** to document how to use `react-most`, and I don't really need to, but
there's only 3 things you should notice when using `react-most`, I'll explain by a simple counter app.

Also, you can refer to: 

- various [Examples](https://github.com/reactive-react/react-most/wiki/examples)
- simple [API](https://github.com/reactive-react/react-most/wiki/api)
- [Best Practices](https://github.com/reactive-react/react-most/wiki/frp-best-practice)
- [Wiki](https://github.com/reactive-react/react-most/wiki)


### 1. Create a simple stateless component
![](https://github.com/reactive-react/react-most/wiki/images/view.png)
```html
const CounterView = props => (
  <div>
    <button onClick={props.actions.dec}>-</button>
    <span>{props.count}</span>
    <button onClick={props.actions.inc}>+</button>
  </div>
)
```
### 2. Define Counter's behavior
![](https://github.com/reactive-react/react-most/wiki/images/behavior.png)

1. A counter can have actions of `inc` and `dec`, which will send either `{type: 'inc'}` or `{type:'dec'}` to `Intent Stream` upon being called.
2. A counter reactively generates a state transformation function when it receives an `Intent` of either type `inc` or `dec`.

```js
const counterable = connect((intent$) => {
  return {
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
    inc: () => ({ type: 'inc' }),
    dec: () => ({ type: 'dec' })
  }
})
```

### 3. Connect behavior and view
![](https://github.com/reactive-react/react-most/wiki/images/wrap.png)
```js
const Counter = counterable(CounterView)

render(
  <Most>
    <Counter />
  </Most>,
  document.getElementById('app')
);
```

## Features
Inspired by Redux and Functional Reactive Programming, `react-most` allows you to model user events, actions, and data as reactive streams.  Now you can map, filter, compose, and join those streams to form your application's state.

### Purely Functional, Declarative, and Monadic
In imperatively written code, you describe step-by-step how to process data.  With `react-most`, we simply define data transformations, then compose them to form our data flow. There are no variables, no intermediate state, and no side effects in your data flow's data composition!

### Composable and Reusable Sinks
In Redux, reducers' use of `switch` statements can make them difficult to compose. Unlike reducers, sinks are reusable observable object.

Wrapper is simply a function and easily composable.

```js
const countBy1 = connect(...)
const countBy2 = connect(...)
const Counter = countBy1(countBy2(CounterView))
// or
const counterable = compose(countBy1, countBy2)
const Counter = counterable(CounterView)
```

### Easy to test, no need for mocks
Because UI and UI behavior are loosely coupled, you can test a React component by just passing it data. Behaviors can be tested by calling actions and then verifying the state.

```js
import {stateHistoryOf, Engine } from 'react-most-spec';
let counterWrapper = TestUtils.renderIntoDocument(
        <Most engine={Engine}>
          <Counter history={true} />
        </Most>
)
let counter = TestUtils.findRenderedComponentWithType(counterWrapper, Counter)
counter.actions.inc()
counter.actions.inc()
counter.actions.inc()
expect(stateHistoryOf(counter)[2].count).toBe(3)
```

see more details about testing at [react-most-spec](https://github.com/reactive-react/react-most-spec) or [todomvc example](https://github.com/reactive-react/react-most/blob/master/examples/todomvc/src/components/__tests__/MainSection-spec.jsx)

### Async actions
Asynchronous functions, such as Promises, can be converted to a stream and then flat-mapped.

```js
intent$.map(promise => most.fromPromise(promise))
	.flatMap(value => /* use the results */)
```

### Transducers support
[Transducer](https://github.com/cognitect-labs/transducers-js) is another high-performance, functional way to compose non-monadic data flows.

Writing actions as transducers can improve reusability.

### Time Travel
Because we have all actions' streams, we can easily reproduce the actions at anytime, or get snapshot of the state's stream and going back in time.

By passing the `history` parameter into the options of `connect`
```js
connect(intent$=>[/* your awesome flow */], { history: true })(App)
```

or passing `history` as a prop
```js
<Most>
  <Counter history={true}/>
</Most>
```

A stream with all of the state's history will be created, called `historyStream`.

### Modular and Easy to Extend
If you're more familiar with RxJS, it's easy to use it with `react-most` in place of `most`.  Simply pass a prop called `engine` to the `Most` component.

> But, I'm strongly RECOMMEND to use the default engine `most.js`, it's how `react-most` originally built for, and production ready.

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
