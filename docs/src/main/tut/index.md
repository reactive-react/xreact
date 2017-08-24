---
layout: home
title:  "Reactive X React"
section: "home"
technologies:
 - first: ["Functional", "Declarative and composable data flow"]
 - second: ["Reactive", "Asynchronous flow made easy"]
 - third: ["React", "Seamless and idiomatic integration with React"]
---

Xreact is a lightweight Higher Order State Component for React. 

Data flow in Xreact is observable and unidirectional.

![](https://www.evernote.com/l/ABcSUEkq5_xPTrWy_YdF5iM1Fxu14WMB7eAB/image.png)

## Get Started
```
npm install xreact --save
# or
yarn add xreact
```

A [quick walk through of a counter app](Get-Started.html) will give you a brief idea of how Xreact work.

## Features
Inspired by Redux and Functional Reactive Programming, `xreact` allows you to model user events, actions, and data as reactive streams.  Now you can map, filter, compose, and subscribe those streams into your application's state.

### Purely Functional, Declarative, and Monadic
In imperatively written code, you describe step-by-step how to process data.  With `xreact`, we simply define data transformations, then compose them to form our data flow. There are no variables, no intermediate state, and no side effects in your data flow's data composition!

### Fantasy Land<sup>beta</sup>

![](https://github.com/fantasyland/fantasy-land/raw/master/logo.png)

There's also [Fantasy Land](https://github.com/fantasyland/fantasy-land) implementation in `src/fantasy.ts`, you can see [bmi calculator example](https://github.com/reactive-react/xreact/blob/master/examples/bmi-calc/app.tsx) to get the idea.

### Typesafe and scalable
Rewritten in Typescript, and abstract Stream as Higher Kind type so easier to bring new FRP lib to integrete with xreact.

### Composable and Reusable `Plan`
In Redux, reducers' use of `switch` statements can make them difficult to compose. Unlike reducers, the function `x` return is simply a function which can easily compose.


```js
const Counter = x(plan1)(x(plan2)(CounterView))
// is the same as
const plan1_x_plan2_x = compose(x(plan1), x(plan2))
const Counter = plan1_x_plan2_x(CounterView)
```

what really happen behind compose is actually ES6 style mixin, so there won't be any extra layer of HoC and no any performance overhead.

### Easy to test, no need for mocks
Because UI and UI behavior are loosely coupled, you can test a React component by just passing it data. Behaviors can be tested by calling actions and then verifying the state.

```js
import {mount} from 'enzyme'
import * as rx from 'xreact/lib/xs/rx'
import {rx as xtest} from 'xreact/lib/xtests'
const mountx = compose(mount, c => React.createFactory(X)({ x: rx }, c))

let counterX = mountx(
  <Counter />
)
          
let counter = counterX.find(Counter).getNode()
let counterView = counterX.find(CounterView)
let actions = counterView.prop('actions')
it('add intent to intent$ and go through sink$', () => {
  return new xtest
    .do([
      actions.inc,
      actions.inc,
      actions.inc,
    ])
    .collect(counter)
    .then(state => expect(state.count).toBe(3))
})

```

see more details about testing examples at <https://github.com/reactive-react/xreact/blob/master/src/__tests__/xtest.tsx>

### Async actions made easy
Asynchronous functions, such as Promises, can be converted to a stream and then flat-mapped.

```js
import {Observable} from '@reactivex/rxjs/Observable'

...

intent$.filter(x=>x.kind=='rest')
  .flatMap(({url}) => Observable.fromPromise(rest(url)))
  .map(...)

...
```

see `rest(url)` will return a `Promise`,

### Higher level extract and ready for any FRP library
xreact came with 2 FRP libs of choices, rxjs and mostjs, for any new lib you only need to implement the `StaticStream` with your prefered lib as Higher Kind Type.

more details about HKT implementation in TypeScript is [here](https://github.com/gcanti/fp-ts)


## Thanks to...
- [rxjs](https://github.com/ReactiveX/rxjs)
- [most](https://github.com/cujojs/most)
- [React](http://facebook.github.io/react/)
- [redux](https://github.com/rackt/redux)
- [Om](https://github.com/omcljs/om)
- [Cycle](http://cycle.js.org/)
- [transdux](https://github.com/jcouyang/transdux)

<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MSMNJ7D');</script>
<!-- End Google Tag Manager -->

