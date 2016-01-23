# React Most
A Monadic Reactive State Container for React Components

## What
Most is very high performance Monadic reactive streams lib. Rich User Interaction App is natively fit for Reactive Programming.

React is awesome for writing UI Components.

so, `react-most` will make you React Components Reactive.

`react-most` is simple and only 90 lines of code. only depends on most and react.

## Why

Redux is awesome, but if you're big fan of Functional Reactive Programming, you would've imaged all state, user events, actions and data are Streams, then we can map,filter,compose, combine those streams to React state stream. How awesome will it be.

## How
there's only 3 things you should notice when using `react-most`

### 1. Component Wrapper

### 2. Define How to connect Component and Streams

### 3. Use the actions

### examples
<./examples>

## Performance
`react-most` no more than creating stream from your actions, and bind it to state stream. no any other computations happen in `react-most`. so please refer to [most.js's perf](https://github.com/cujojs/most/tree/master/test/perf)

## Thanks to...
- [most](https://github.com/cujojs/most)
- [redux](https://github.com/rackt/redux)
- [Om](https://github.com/omcljs/om)
- [Cycle](http://cycle.js.org/)
- [React](http://facebook.github.io/react/)
