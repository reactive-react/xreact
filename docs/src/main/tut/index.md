---
layout: home
title:  "Reactive x React"
section: "home"
technologies:
 - first: ["Functional", "Declarative and composable data flow"]
 - second: ["Reactive", "Asynchronous flow made easy"]
 - third: ["React", "Seamless and idiomatic integration with React"]
---

xReact is a lightweight reactive HOC for React. Data flow in xReact is observable and unidirectional.

![](https://www.evernote.com/l/ABdv2Ks5f7dNQKxyoz7Q1eB9Xm9vy3U11ZMB/image.png)

## Get Started
```
npm install xreact --save
# or
yarn add xreact
```

- Come from redux? 👉 <https://xreact.oyanglul.us/Get-Started.html>
- Come from fantasy land? 🌈 <https://xreact.oyanglul.us/Fantasy.html>
- Examples 👇
  - <https://github.com/reactive-react/xreact/tree/master/examples>
  - <https://xreact.oyanglul.us/Examples.html>

## Features

### Purely Functional, Declarative, and Monadic
In imperatively code, you have to describe verbose of how to process data.  With `xreact`, we simply define data transformations, then compose them to form data flow. There are no variables, no intermediate state, and no side effects in your data flow's data composition!

For FP maniac, you will definitely have fun with [FantasyX](https://xreact.oyanglul.us/Fantasy.html), which implemented Functor and Applicative type class instances on top of xReact, with State Monad.

### Typesafe and scalable
xReact is 100% Typescript! Turn your runtime bugs into compile time errors, fail and fix early.

### High level but 0 cost abstraction
In Redux, reducers' use of `switch` statements can make them difficult to compose. Unlike reducers, the function `x` return is simply a function which can easily compose.

```js
const Counter = x(plan1)(x(plan2)(CounterView))
// is the same as
const plan1_x_plan2_x = compose(x(plan1), x(plan2))
const Counter = plan1_x_plan2_x(CounterView)
```

What really happen behind compose is actually ES6 style mixin, so there won't be any extra layer of HoC or any performance overhead.

### Asynchronous made easy
Asynchronous functions, such as Promises, can be converted to a stream and then flat-mapped.

```js
intent$.filter(x=>x.kind=='rest')
  .flatMap(({url}) => fromPromise(fetch(url)))
```

where `fetch(url)` will return a `Promise`, and fromPromise will transform a `Promise` into `Observable`, so you can flat it in intent stream which is also a `Observable`.

### Reactive libs of your choice
xReact came with 2 FRP libs of choices, rxjs and mostjs, for any new libs you only need to implement the `StaticStream` with your preferred lib as Higher Kind Type, just like how we done for [mostjs](https://github.com/reactive-react/xreact/blob/master/src/xs/most.ts).

More details about HKT implementation in TypeScript is [here](https://github.com/gcanti/fp-ts), but you don't really need to know this.

## Copyright and License
All code is available to you under the MIT license. The design is informed by many other projects:
- [rxjs](https://github.com/ReactiveX/rxjs)
- [most](https://github.com/cujojs/most)
- [React](http://facebook.github.io/react/)
- [purescript-flare](https://github.com/sharkdp/purescript-flare)
- [redux](https://github.com/rackt/redux)
- [Om](https://github.com/omcljs/om)
- [Cycle](http://cycle.js.org/)
- [transdux](https://github.com/jcouyang/transdux)
