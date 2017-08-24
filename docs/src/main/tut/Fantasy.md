---
layout: docs
title: XReact Fantasy
section: en
position: 1
---

# XReact Fantasy

xreact is already a Functional library that can integrete FRP lib rxjs or mostjs into react. But it's still too many details you need to care while modeling UI components.

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

We can now (from v2.3.0) lift a normal function to xReact as well.

Let's take BMI calculator for example.

the key business logic of a BMI calculator is very simple

```js
function calcBMI(weight, height) {
  let bmi = 0
  let health = '...'
  if (height && weight) {
    bmi = height / (weight * weight)
  }
  if (bmi < 18.5) health = 'underweight'
  else if (bmi < 24.9) health = 'normal'
  else if (bmi < 30) health = 'Overweight'
  else health = 'Obese'
  return { bmi: bmi.toString(), health }
}
```

The implementation doesn't seem to very Functional, but it doesn't matter since it's very low level implementation. It's a very easy to use, pure function:

```js
calcBMI(65, 1.72)
// => Object { bmi: "23.661438615467823", health: "normal" }
```

Now we have a pretty simple function that can calc BMI and return health level and bmi score.

How can we lift this function and make the exactly same functional React Component then?

```js
let xplan = lift2(calcBMI)(xinput('weight'), xinput('height'))
```

