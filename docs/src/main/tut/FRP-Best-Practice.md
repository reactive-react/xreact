---
layout: docs
title: Functional Best Practice in xReact
section: en
---

Functional Best Practice in xReact
==================================

I'll guide you to some good practice of Functional Programming through the Counter example.

> It's really helpful even you don't use xreact, the FP idea is common and applicable to anywhere even for redux project.

use Union Type to define Intent
-------------------------------

union-type is a awesome library to define union type/case class.

most flux-like library will define Intents using the keyword \`type\`

``` javascript
inc: () => ({type: 'inc'})
```

but union type fit perfectly to define Intent

`Intent.js`

``` javascript
import Type from 'union-type'
export default Type({
  Inc: []
  Dec: []
})
```

case Intent, not switch
-----------------------

it's like case class in scala, you get a lot of benefit by using union-type Intent

``` javascript
import Intent from 'intent'
const counterable = x(intent$ => {
    return {
        sink$: intent$.map(Intent.case({
            Inc: () => state => ({count: state.count + 1}),
            Dec: () => state => ({count: state.count - 1}),
            _: () => state => state
        })),
        actions: {
            inc: Intent.Inc,
            dec: Intent.Dec,
        }
    }
})
```

pattern match case class
------------------------

like scala, union type can also contain values

``` javascript
import Type from 'union-type'
export default Type({
  Inc: [Number]
  Dec: [Number]
})
```

if you define Intent constructors, you will be able to destruct them via `case`

``` javascript
import Intent from 'intent'
const counterable = x(intent$ => {
    return {
        sink$: intent$.map(Intent.case({
            Inc: (value) => state => ({count: state.count + value}),
            Dec: (value) => state => ({count: state.count - value}),
            _: () => state => state
        })),
        actions: {
            inc: Intent.Inc,
            dec: Intent.Dec,
        }
    }
})
```

lens
----

lens is composable, immutable, functional way to view, update your state

you can use `lens` implemented by ramda, or `update` in lodash

``` javascript
import {lens, over, inc, dec, identity} from 'ramda'
const counterable = x(intent$ => {
    let lensCount = lens(prop('count'))
    return {
        sink$: intent$.map(Intent.case({
            Inc: () => over(lensCount, inc)
            Dec: () => over(lensCount, dec),
            _: () => identity
        }))
    }
})
```

flatMap
-------

when the value is async, e.g. promise

it could be response from rest request, or other async IO

``` javascript
import when from 'when'
import {just, from, lens, over, set, inc, dec, identity, compose} from 'ramda'
const counterable = x(intent$ => {
    let lensCount = lens(prop('count'))
    return {
        sink$: intent$.map(Intent.case({
            Inc: () => over(lensCount, inc)
            Dec: () => over(lensCount, dec),
            _: () => identity
        }))
        data$: just(0)
            .flatMap(compose(from, when))  // <-- when is a async value
            .map(set(lensCount))
    }
})
```

Composable wrapper
------------------

x wrappers are composable, just like functions

``` javascript
import Type from 'union-type'
export default Type({
    Inc: [Number],
    Dec: [Number],
    Double: [],
    Half: []
})
```

create a new wrapper with some kind of behaviors

``` javascript
const doublable = x(intent$ => {
    let lensCount = lens(prop('count'))
    return {
        sink$: intent$.map(Intent.case({
            Double: () => over(lensCount, x=>x*2)
            Half: () => over(lensCount, x=>X/2),
            _: () => identity,
        }))
        actions: {
            double: Intent.Double,
            half: Intent.Half,
        }
    }
})
```

compose doublable and increasable

``` javascript
const Counter = doublable(increasable(CounterView))
```

`CounterView` then get both abilities of double/half and inc/dec

``` javascript
const CounterView = props => (
  <div>
    <button onClick={props.actions.half}>/2</button>
    <button onClick={props.actions.dec}>-</button>
    <span>{props.count}</span>
    <button onClick={props.actions.inc}>+</button>
    <button onClick={props.actions.double}>*2</button>
  </div>
)
```

now our FRP counter example will become something like [this](https://github.com/reactive-react/xreact/blob/master/examples/frp-counter/app.jsx)
