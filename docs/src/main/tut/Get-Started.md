---
layout: docs
title:  Quick Start
section: en
position: 1
---

![](https://www.evernote.com/l/ABcSUEkq5_xPTrWy_YdF5iM1Fxu14WMB7eAB/image.png)

## Terminology
- **Machine**: a machine can emit `Update` to a timeline `update$`, and can be operated by calling function in `actions`
- **Plan**: a Plan is a function that describe how to create a `Machine`
- **Update**: a function of `currentState -> nextState` 
- **Action**: a function that create instance of `Intent`
- **Intent**: describe what you want to do
- **Intent Stream**: a timeline of every `Intent` created by each `Action`

## Quick Start

Sorry we don't have a **book** to document how to use xreact, and I don't really need to,
there's only 3 things you should notice when using xreact, I'll explain by a simple counter app.

<iframe src="https://www.webpackbin.com/bins/-KsSVkmGpVrLlwylSrkE" frameborder="0" width="100%" height="500"></iframe>

### 1. Define a simple stateless View component

![](https://www.evernote.com/l/ABd-YTQc2FVBjqOEkpiFZDltPloti8a2Hq8B/image.png)

```html
const CounterView = ({actions, count}) => (
  <div>
    <button onClick={actions.dec}>-</button>
    <span>{count}</span>
    <button onClick={actions.inc}>+</button>
  </div>
)
```

every View component expected a `actions` fields in `props`

### 2. Define a `Plan`

![](https://www.evernote.com/l/ABeLlbr3vQNM_JKfcd_W4zfW262lxWJhOsMB/image.png)

After we have a pretty view for represention and inteacting interface, we can define how to update the view, or "how to react on actions". In such case:

1. A counter can have actions of `inc` and `dec`, which will send `Intent` of `{type: 'inc'}` or `{type:'dec'}` to `Intent Stream` upon being called.
2. A counter reactively generates `Update` when it receives an `Intent` of either type `inc` or `dec`.

```js
const plan = (intent$) => {
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
      dec: () => ({ type: 'dec' })
    }
  }
}
```
a `Plan` will take `intent$`(Intent Stream) and return a `Machine`.

a `Machine` defines

- how you can act on the machine 
- how the machine will react on intents.

### 3. Plan X View

![](https://www.evernote.com/l/ABdv2Ks5f7dNQKxyoz7Q1eB9Xm9vy3U11ZMB/image.png)

```js
import {render} from 'react-dom'
import {x, X} from 'xreact/lib/x'
import * as rx from 'xreact/lib/xs/rx'

const Counter = x(plan)(CounterView)

render(
  <X x={rx}>
    <Counter />
  </X>,
  document.getElementById('app')
);
```
`Counter` is product(x) of `plan` and `CounterView`, which means it can react to `Intent` as it's plan, and update `CounterView`

`<X></X>` will provide a `intent$` instance.


## Type Safe Counter

If you are TypeScript user and want to enjoy a type safe counter app, it's simple to do so since Xreact is written 100% in TypeScript.

<iframe src="https://www.webpackbin.com/bins/-KsSYQVTkFjd_MQon3b9" frameborder="0" width="100%" height="500"></iframe>
