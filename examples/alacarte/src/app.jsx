import React from 'react';
import { render } from 'react-dom';
import Most, { connect } from 'react-most'
import {
  injectorFrom,
  interpreterFrom,
  interpretExpr,
  Functor,
  interpreterFor,
  inject,
} from 'alacarte.js'

const compose = f => g => x=> f(g(x))
function Add(value0) {
  this.value0 = value0
}

function Lit(value0) {
  this.value0 = value0
}
function Over(value0, value1) {
  this.value0 = value0
  this.value1 = value1
}

const functorLit = new Functor(f => v => new Lit(v.value0))
const functorAdd = new Functor(f => v => new Add(f(v.value0)))
const functorOver = new Functor(f => v => new Over(f(v.value0), f(v.value1)))

function injectLit(injector) {
  return n => inject(injector(functorLit))(new Lit(n))
}

function injectAdd(injector) {
  return (a, b) => inject(injector(functorAdd))(new Add(a, b))
}

function injectOver(injector) {
  return (a, b) => inject(injector(functorOver))(new Over(a, b))
}

function injectState(injector) {
  return n => inject(injector(functorState))(new State(n))
}

const evalAdd = interpreterFor(functorAdd, function (v) {
  return x => x + v.value0
});

const evalLit = interpreterFor(functorLit, function (v) {
  return v.value0
});

const evalOver = interpreterFor(functorOver, function (v) {
  let newstate = {}
  return state => (newstate[v.value0] = v.value1(state[v.value0]), newstate)
});

let interpreter = interpreterFrom([evalLit, evalAdd, evalOver])
let injector = injectorFrom([functorLit, functorAdd, functorOver])

let add = injectAdd(injector)
let lit = injectLit(injector)
let over = injectOver(injector)

const printAdd = interpreterFor(functorAdd, function (v) {
  return `(_ + ${v.value0})`
});

const printLit = interpreterFor(functorLit, function (v) {
  return v.value0.toString()
});

const printOver = interpreterFor(functorOver, function (v) {
  return `over ${v.value0} do ${v.value1}`
});

const printer = interpreterFrom([printLit, printAdd, printOver])
const CounterView = props => (
  <div>
    <button onClick={props.actions.dec}>-</button>
    <span>{props.count}</span>
    <button onClick={props.actions.inc}>+</button>
</div>
)

CounterView.defaultProps = { count: 0 };

const counterable = connect((intent$) => {
  return {
    sink$: intent$.tap(compose(console.log)(interpretExpr(printer)))
                  .map(interpretExpr(interpreter)),
    inc: () => over(lit('count'), add(lit(1))),
    dec: () => over(lit('count'), add(lit(-1))),
  }
})

const Counter = counterable(CounterView)

render(
  <Most>
    <Counter />
  </Most>
  , document.getElementById('app'));
