---
layout: docs
title: 读我
section: zh
position: 2
---

![](https://www.evernote.com/l/ABcSUEkq5_xPTrWy_YdF5iM1Fxu14WMB7eAB/image.png)

# 单词表

- **Machine**: 有一个 `update$` 流，内部放着 `Update<State>`类型的数据, 还有一些 `actions`，调用`actions`会将 `Intent` 放入 `intent$`
- **Plan**: 是 `Machine` 的工厂方法
- **Update**: 从旧 state 到新 state 的函数 `currentState -> nextState` 
- **Action**: 创建 `Intent` 实例并放到 `intent$` 中
- **Intent**: 要做的事情
- **Intent Stream**: `Intent` 实例创建的时间线

# 快速开始
我将用 =counter= 作为例子来引入 xreact.

基本上使用 =xreact= 只需要3步.

1. 创建一个无状态的view component
2. 创建一个定义machine 行为的 plan 
3. plan x view

## 1. 创建一个无状态的 view component
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

View 期待 props.actions 会有一些操作，想象成把机器人 machine 的遥控器传给了 View

## 2. 制定如何制造Machine的 Plan

![](https://www.evernote.com/l/ABeLlbr3vQNM_JKfcd_W4zfW262lxWJhOsMB/image.png)

计划机器人会响应事件流 `intent$` 中的两种 `Intent`，而且遥控器actions可以有 `inc` 和 `dec` 两种操作

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

## 3. plan x view
下来，把 plan 和 view 乘一起就好了

![](https://www.evernote.com/l/ABdv2Ks5f7dNQKxyoz7Q1eB9Xm9vy3U11ZMB/image.png)

```js
import {render} from 'react-dom'
import X, {x} from 'xreact/lib/x'
import * as rx from 'xreact/lib/xs/rx'

const Counter = x(plan)(CounterView)

render(
  <X x={rx}>
    <Counter />
  </X>,
  document.getElementById('app')
);
```
`Counter` 是 `plan` 和 `CounterView` 的乘积, 意思是 Counter 现在有一个机器人，它连上了一个触摸的显示屏，可以点，可以显示状态

`<X></X>` 会给 Counter 提供 `intent$` 实例.


## 接下来

- [[React-Most 函数式最佳实践]]
