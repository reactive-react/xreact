---
layout: docs
title:  Examples
section: en
position: 6
---

- [import xreact](#org202661d)
- [Example 1: Two number multiply](#orgd564fbd)
- [Example 2: Two Inputs](#org5677d81)
- [Example 3: Semigroup](#org863e564)
- [Example 4: Traverse](#orgfd54baa)
- [Example 5: Asynchronous](#orgd82b260)
- [Example 6: Fold](#org7a7a3b6)
- [Example 7: Merge](#orga97410a)
- [Example 8: Fold multiple buttons](#orgdd7473f)
- [Example 13: Adding items to a list](#orgb3b8b4e)



<a id="org202661d"></a>

# import xreact

```tsx
import {pure, lift2, X, xinput, fromEvent, traverse, fold} from '../src'
import * as React from 'react';
import { render } from 'react-dom';
import * as RX from '../src/xs/rx'
function xmount(component, dom) {render(React.createFactory(X)({ x: RX }, component), dom)}
```


<a id="orgd564fbd"></a>

# Example 1: Two number multiply

```tsx
let Xeg1 = lift2((x:number,y: number) => x * y)(pure(6), pure(5))
let ViewEg1 = props => <p className="result">{props.product}</p>
let Eg1 = Xeg1.map(a=>({product: a})).apply(ViewEg1)
```

<p><div id="eg1"></div></p>


<a id="org5677d81"></a>

# Example 2: Two Inputs

```tsx
let Xeg2 = lift2((x:number,y: number) => x * y)(fromEvent('change', 'n1', '5').map(x=>~~x), fromEvent('change', 'n2', '6').map(x=>~~x))
let ViewEg2 = props => <section>
  <p><input type="number" name="n1" onChange={props.actions.fromEvent} defaultValue="5"/></p>
  <p><input type="number" name="n2" onChange={props.actions.fromEvent} defaultValue="6"/></p>
  <p><span className="result">{props.product}</span></p>
</section>
let Eg2 = Xeg2.map(a=>({product: a})).apply(ViewEg2)
```

<p><div id="eg2"></div></p>


<a id="org863e564"></a>

# Example 3: Semigroup

```tsx
let Xeg3 = fromEvent('change', 'string1', 'Jichao')
.concat(pure(' '))
.concat(fromEvent('change', 'string2', 'Ouyang'))

let ViewEg3 = props => <section>
  <p><input type="text" name="string1" onChange={props.actions.fromEvent} /></p>
  <p><input type="text" name="string2" onChange={props.actions.fromEvent} /></p>
  <p><span className="result">{props.semigroup}</span></p>
</section>

let Eg3 = Xeg3.map(a=>({semigroup: a})).apply(ViewEg3)
```

<p><div id="eg3"></div></p>


<a id="orgfd54baa"></a>

# Example 4: Traverse

```tsx
function sum(list){
  return list.reduce((acc,x)=> acc+x, 0)
}
let list = ['1', '2', '3', '4', '5', '6', '7']
let Xeg4 = traverse(
  (defaultVal, index)=>(fromEvent('change', 'traverse'+index, defaultVal)),
  list)
  .map(xs=>xs.map(x=>~~x))
  .map(sum)

let ViewEg4 = props => <section>
{list.map((item, index) => (<p>
<input key={index} type="number" name={"traverse" + index} onChange={props.actions.fromEvent} defaultValue={item} />
</p>))
}
  <p><span className="result">{props.sum}</span></p>
</section>

let Eg4 = Xeg4.map(a=>({sum: a})).apply(ViewEg4)
```

<p><div id="eg4"></div></p>


<a id="orgd82b260"></a>

# Example 5: Asynchronous

```tsx
function bmiCalc(weight, height) {
  return {
    result:fetch(`https://gist.github.com.ru/jcouyang/edc3d175769e893b39e6c5be12a8526f?height=${height}&weight=${weight}`)
      .then(resp => resp.json())
      .then(resp => resp.result)
  }
}

let Xeg5 = lift2(bmiCalc)(fromEvent('change', 'weight', '70'), fromEvent('change', 'height', '175'))

let ViewEg5 = props => (
  <div>
    <label>Height: {props.height} cm
      <input type="range" name="height" onChange={props.actions.fromEvent} min="150" max="200" defaultValue={props.height} />
    </label>
    <label>Weight: {props.weight} kg
      <input type="range" name="weight" onChange={props.actions.fromEvent} min="40" max="100" defaultValue={props.weight} />
    </label>
    <p>HEALTH: <span>{props.health}</span></p>
    <p>BMI: <span className="result">{props.bmi}</span></p>
  </div>
)

let Eg5 = Xeg5.apply(ViewEg5)
```

<p><div id="eg5"></div></p>


<a id="org7a7a3b6"></a>

# Example 6: Fold

```tsx
let Xeg6 = fold((acc:number,i: number) => acc+i, 0, fromEvent('click', 'increment').map(x=>1))
let ViewEg6 = props => <p>
  <span className="result">{props.count}</span>
  <input type="button" name="increment" value="+1" onClick={e=>props.actions.fromEvent(e)} />
</p>
let Eg6 = Xeg6.map(a=>({count: a})).apply(ViewEg6)
```

<p><div id="eg6"></div></p>


<a id="orga97410a"></a>

# Example 7: Merge

```tsx
let Xeg7 = fold(
(acc:number,i: number) => acc+i, 0,
fromEvent('click', 'increment').map(x=>1).merge(
fromEvent('click', 'decrement').map(x=>-1)))

let ViewEg7 = props => <p>
    <input type="button" name="decrement" value="-" onClick={e=>props.actions.fromEvent(e)} />
    <span className="result">{props.count}</span>
    <input type="button" name="increment" value="+" onClick={e=>props.actions.fromEvent(e)} />
</p>
let Eg7 = Xeg7.map(a=>({count: a})).apply(ViewEg7)
```

<p><div id="eg7"></div></p>


<a id="orgdd7473f"></a>

# Example 8: Fold multiple buttons

<p><div id="eg8"></div></p>

<script src="example.js"></script>


<a id="orgb3b8b4e"></a>

# Example 13: Adding items to a list
