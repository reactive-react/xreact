import * as React from 'react';
import { render } from 'react-dom';

import X, { x } from 'xreact'
import * as rx from 'xreact/lib/xs/rx'
import '@reactivex/rxjs/dist/cjs/add/operator/filter'
import '@reactivex/rxjs/dist/cjs/add/operator/do'
import {
  Expr,
  Val,
  injectorFrom,
  interpreterFrom,
  interpretExpr,
  interpreterFor,
  isInjectedBy,
} from 'alacarte.js'

const compose = f => g => x=> f(g(x))

let {Add, Over} = Expr.create({
  Add: ['fn'],
  Over: ['prop', 'fn']
})

// Instances of Interpreters
const evalAdd = interpreterFor(Add, function (v) {
  return x => x + v.fn(x)
});

const evalVal = interpreterFor(Val, function (v) {
  return ()=> v.value
});

const evalOver = interpreterFor(Over, function (v) {
  let newstate = {}
  let prop = v.prop()
  return state => (newstate[prop] = v.fn(state[prop]), newstate)
});

// You can define any Interpreters you want, instead of eval value, this interpreter print the expressions
const printAdd = interpreterFor(Add, function (v) {
  return `(_ + ${v.fn})`
});

const printVal = interpreterFor(Val, function (v) {
  return v.value.toString()
});

const printOver = interpreterFor(Over, function (v) {
  return `over ${v.prop} do ${v.fn}`
});

const printer = interpreterFrom([printVal, printAdd, printOver])

const CounterView = props => (
  <div>
    <button onClick={props.actions.dec}>{props.dec}</button>
    <span>{props.count}</span>
    <button onClick={props.actions.inc}>{props.inc}</button>
</div>
)

CounterView.defaultProps = { count: 1 };

const counterable = x((intent$) => {
  // Compose a Interpreter which can interpret Lit, Add, Over
  let interpreter = interpreterFrom([evalVal, evalAdd, evalOver])
  // Injector that can inject Lit, Add, Over
  let injector = injectorFrom([Val, Add, Over])

  let [val, add, over] = injector.inject()

  return {
    update$: intent$.filter(isInjectedBy(injector)) // <-- filter only expressions compose with type Lit :+: Add :+: Over
                    .do(compose(console.log)(interpretExpr(printer))) // interpret with printer
                    .map(interpretExpr(interpreter)), // interpret with interpreter(eval value)
    actions: {
      inc: () => over(val('count'), add(val(1))), // you can compose expressions to achieve your bussiness
      dec: () => {
        let aNewInjector = injectorFrom([Val, Add, Over])
        let [val, add, over] = aNewInjector.inject()
        return over(val('count'), add(val(-1)))
      }
    } // only a expr with same type and order can be interpret
  }
})

// a new mult expr is add without modify any of the current code
let {Mult} = Expr.create({
  Mult: ['fn'],
})
const evalMult = interpreterFor(Mult, function (v) {
  return x => x * v.fn(x)
});

let printMult = interpreterFor(Mult, function (v) {
  return `(_ * ${v.fn})`
});

const multable = x((intent$) => {
  let injector = injectorFrom([Val, Add, Over, Mult])
  let [val, add, over, mult] = injector.inject()
  let interpreter = interpreterFrom([evalVal, evalAdd, evalOver, evalMult])
  let printer = interpreterFrom([printVal, printAdd, printOver, printMult])
  return {
    update$: intent$.filter(isInjectedBy(injector))
                    .do(compose(console.log)(interpretExpr(printer)))
                    .map(interpretExpr(interpreter)),
    actions: {
      inc: () => over(val('count'), mult(val(2))),
      dec: () => over(val('count'), mult(val(0.5))),
    }
  }
})
const Counter = counterable(CounterView)
const Multer = multable(CounterView)
render(
    <X x={rx}>
    <div>
      <Counter inc="+1" dec="-1" />
      <Multer inc="*2" dec="/2"/>
    </div>
  </X>
  , document.getElementById('app'));
