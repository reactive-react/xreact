---
layout: docs
title: Fantasy
section: en
position: 3
---

# XReact Fantasy

xreact is a Functional library that can integrate FRP lib rxjs or mostjs into react. But there're still too many details you need to care while modeling UI components.

The implement of [Fantasy Land](https://github.com/fantasyland/fantasy-land), which will change the way you model and implement UI entirely.

## `lift`

Let's use List as example, what `lift` does is very similar to `map`

```js
[1,2,3].map(x=>x+1) // => [2,3,4]
```

```js
lift(x=>x+1)([1,2,3]) // => [2,3,4]
```

You should notice that both lift and map transform `x => x + 1` which should only able to apply to `Number`, to a function that can apply to `Array[Number]`

We can now (from v2.3.0) lift a normal function to which can apply to xReact FantasyX as well.

Let's take a look at a really simple example, multiply 2 numbers.

```js
// Number -> Number -> Number
function mult(a, b) {
  return a * b
}
mult(1, 2)
```

But if we need a React Component that multiply 2 numbers from 2 input box, how complicated it could be?

Now you get simply get a free FantasyX from just any normal function, via `lift`.

```js
// FantasyX -> FantasyX -> FantasyX
let xMult = lift2(mult)
```

`mult` need 2 arguments, that's why we use `lift2` here.


Now that we have on function `xMult` that can turn 2 FantasyX into one, lets do this:

```js
let XMult = xMult(xinput('a'), xinput('b'))
```

and we got a new FantasyX `XMult` with the computation built in.

`xinput` is an FantasyX abstraction of input box.

All we have so far was just a FantasyX `XMult` with computation composed inside, and we need a View to display and interact with. Here comes a really simple Stateless Component

```js
const View = props => (
  <div>
    <input name="a" onChange={props.actions.fromEvent} defaultValue={props.a}/>
    <input name="b" onChange={props.actions.fromEvent} defaultValue={props.b}/>
    <div>{props.output}</div>
  </div>
)
View.defaultProps = { a: "", b: "",output:""}
```

apply XMult to View then we'll get a React Component

```js
let Mult = XMult.apply(View)
```

<https://www.webpackbin.com/bins/-KoGxSJ-3pOi4DicUvaq>

<iframe src="https://www.webpackbin.com/bins/-KoGxSJ-3pOi4DicUvaq" frameborder="0" width="100%" height="500"></iframe>

## Functor

FantasyX also implemented Functor, so we can transform one FantasyX to another

For example, from `XMult`, we could simply transform it into a `XMMP` with new computation

```js
let XMMP = XMult.map((s) => ({output: s.output * s.output}))
```

it's just like mapping on a list

```js
[1,2,3].map(x=>x*x)
// [2,4,6]
```

<https://www.webpackbin.com/bins/-Kss6m5ORK74CObhAPqB>

<iframe src="https://www.webpackbin.com/bins/-Kss6m5ORK74CObhAPqB" frameborder="0" width="100%" height="500"></iframe>

## Monoid

It's actually Semigroup, but if we have a ID FantasyX, we have Monoid, an Identity FantasyX make sense in that the computation inside is just Identity.

Anyway, let's see how can we combine two FantasyX together

```js
let XCOMBINE = XMMP.concat(XMult)
```

仅此, 我们就得到了一个同时具有 XMMP 与 XMult 行为的 FantasyX

当然, 因为他们都会修改 `state.output`,  合并到一起会导致冲突, 我们稍微修改下 XMMP

```js
let XMMP = XMult.map((s) => ({output2: s.output * s.output}))
```

nothing special just like how you concat two Arrays

<https://www.webpackbin.com/bins/-Kss6m5ORK74CObhAPqB>

<iframe src="https://www.webpackbin.com/bins/-Kss6m5ORK74CObhAPqB" frameborder="0" width="100%" height="500"></iframe>

-------

Check out a more complicated BMI Calculator:

<iframe src="https://www.webpackbin.com/bins/-Ksaj0iHMWD2xC24bAqR" frameborder="0" width="100%" height="500"></iframe>
