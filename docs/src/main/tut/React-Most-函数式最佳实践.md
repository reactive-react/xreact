---
layout: docs
title: xReact 函数式最佳实践
section: zh
---

我将继续使用 Counter 这个简单的例子，逐渐重构以展示如何使用函数式feature

处基
====

先来初级的函数式重构

JavaScript Union Types
---------------

### 使用 Union Type 定义 `Intent`

[union-type](https://github.com/paldepind/union-type) 是一个简单的提供 union type，或者说 case class 的库。

你可能见某dux框架使用的action都带有 `type` 字段，然后用 string 来区分不同的 action 这种难看不健壮的方式。

``` javascript
inc: () => ({type: 'inc'})
```

union-type 太适合解决这个问题了：

`Intent.js`

``` javascript
import Type from 'union-type'
export default Type({
  Inc: []
  Dec: []
})
```

### case Intent, 别 switch

case union-type 是 pattern matching, 不是 switch case

``` javascript
import Intent from 'intent'
const counterable = x(intent$ => {
    return {
        update$: intent$.map(Intent.case({
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

### pattern match union type

union type 还可以带上值，比如 `Inc` 的内容是 `Number`

``` javascript
import Type from 'union-type'
export default Type({
  Inc: [Number]
  Dec: [Number]
})
```

你可以 case `Number` 出啦

``` javascript
import Intent from 'intent'
const counterable = x(intent$ => {
    return {
        update$: intent$.map(Intent.case({
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

TypeScript Union Types
----------------------
使用 TypeScript 的 Union Type 会简单得多, 而且运行时是zero cost, 只会在编译时检查.

```ts
export interface Inc {
  kind: 'inc'
}
export interface Dec {
  kind: 'dec'
}
export type Intent = Inc | Dec
```

稍微缺陷的是 TypeScript 没有 pattern matching

```ts
const counterable = x<"Observable", Intent, State>(intent$ => {
    return {
        update$: intent$.map(intent =>{
          switch(intent.kind) {
          case 'inc': return state => ({count: state.count + 1})
          case 'dec': return state => ({count: state.count + 1})
          default: return state => state'
          }
        }),
        actions: {
            inc: () => ({kind: 'inc'} as Inc),
            dec () => ({kind: 'dec'} as Dec)
        }
    }
})
```

但是没关系, 编译器会保证你case的类型正确, 比如你在case 里写错类型的字符串如 `incblahblah`, 编译不会通过.

lens
----

lens 是 composable, immutable, functional 的更新，观察数据结构的方式

下面是使用 [ramda](http://ramdajs.com/) 的 lens 实现的例子

``` javascript
import {lens, over, inc, dec, identity} from 'ramda'
const counterable = x(intent$ => {
    let lensCount = lens(prop('count'))
     return {
        update$: intent$.map(Intent.case({
            Inc: () => over(lensCount, inc)
            Dec: () => over(lensCount, dec),
            _: () => identity
        }))
    }
})
```

flatMap
-------

当遇到异步的时候，可以简单的 flatMap 到 sink 上

``` javascript
import when from 'when'
import {just, from, lens, over, set, inc, dec, identity, compose} from 'ramda'
const counterable = x(intent$ => {
    let lensCount = lens(prop('count'))
    return {
        update$: intent$.map(Intent.case({
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

组合
----

wrappers 是 composable, 跟函数一样

``` javascript
import Type from 'union-type'
export default Type({
    Inc: [Number],
    Dec: [Number],
    Double: [],
    Half: []
})
```

比如还可以创建一个wrapper，可以翻倍、减半

``` javascript
const doublable = x(intent$ => {
    let lensCount = lens(prop('count'))
    return {
        update$: intent$.map(Intent.case({
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

包在 View 外面

``` javascript
const Counter = doublable(increasable(CounterView))
```

`CounterView` 就有了 `+1` `-1` `*1` `/1`

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

现在我们的Counter 就变成了[这样](https://github.com/reactive-react/react-most/blob/master/examples/frp-counter/src/app.jsx)


搞基
====

掌握了 lens，union-type, flatmap, compose 的概念之后，如果还不够爽，可以用一些更搞基的pattern来让代码的 ~~逼格~~ 扩展性更高一些。比如:

[FantasyX](https://xreact.oyanglul.us/%E8%8C%83%E7%89%B9%E8%A5%BF.html)
-------------------------------------------------------------
Fantasy land 标准的 Functor, Monoid, Applicative

[Data types à la carte](https://github.com/jcouyang/alacarte)
-------------------------------------------------------------

简单的说还是interpreter pattern，但不是用 free monad, 是更简单的combinator，瞬间就能去掉pattern match 和action定义的表达式扩展问题, [比如](https://github.com/jcouyang/alacarte/wiki/读我)
