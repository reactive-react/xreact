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
  supTypeSameAs,
} from 'alacarte.js'

const compose = f => g => x=> f(g(x))

// Data Types of Exprs
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

// Their Functor Instance
const functorLit = new Functor(f => v => new Lit(v.value0))
const functorAdd = new Functor(f => v => new Add(f(v.value0)))
const functorOver = new Functor(f => v => new Over(f(v.value0), f(v.value1)))

// Injectors
function injectLit(injector) {
  return n => inject(injector(functorLit))(new Lit(n))
}

function injectAdd(injector) {
  return (a, b) => inject(injector(functorAdd))(new Add(a, b))
}

function injectOver(injector) {
  return (a, b) => inject(injector(functorOver))(new Over(a, b))
}

// Instances of Interpreters
const evalAdd = interpreterFor(functorAdd, function (v) {
  return x => x + v.value0(x)
});

const evalLit = interpreterFor(functorLit, function (v) {
  return ()=> v.value0
});

const evalOver = interpreterFor(functorOver, function (v) {
  let newstate = {}
  let value = v.value0()
  return state => (newstate[value] = v.value1(state[value]), newstate)
});

// Compose a Interpreter which can interpret Lit, Add, Over
let interpreter = interpreterFrom([evalLit, evalAdd, evalOver])
// Injector that can inject Lit, Add, Over
let injector = injectorFrom([functorLit, functorAdd, functorOver])

// Expressions
let add = injectAdd(injector)
let lit = injectLit(injector)
let over = injectOver(injector)

// You can define any Interpreters you want, instead of eval value, this interpreter print the expressions
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

CounterView.defaultProps = { count: 1 };

const counterable = connect((intent$) => {
    return {
      sink$: intent$.filter(supTypeSameAs(injector)) // <-- filter only expressions compose with type Lit :+: Add :+: Over
        .tap(compose(console.log)(interpretExpr(printer))) // interpret with printer
        .map(interpretExpr(interpreter)), // interpret with interpreter(eval value)
      inc: () => over(lit('count'), add(add(lit(1)))), // you can compose expressions to achieve your bussiness
      dec: () => injectOver(injectorFrom([functorLit, functorOver]))(lit('count'), add(lit(-1))) // a expr with different type like Lit :+: Over will be filtered out(do nothing here)
    }
})

const multable = connect((intent$) => {
  function Mult(value0) {
    this.value0 = value0
  }
  const functorMult = new Functor(f => v => new Mult(f(v.value0)))
  function injectMult(injector) {
    return (a, b) => inject(injector(functorMult))(new Mult(a, b))
  }
  const evalMult = interpreterFor(functorMult, function (v) {
    return x => x * v.value0(x)
  });
  let injector = injectorFrom([functorLit, functorAdd, functorOver, functorMult])
  let add = injectAdd(injector)
  let lit = injectLit(injector)
  let mult = injectMult(injector)
  let over = injectOver(injector)
  let printMult = interpreterFor(functorMult, function (v) {
    return `(_ * ${v.value0})`
  });
  let interpreter = interpreterFrom([evalLit, evalAdd, evalOver, evalMult])
  const printer = interpreterFrom([printLit, printAdd, printOver, printMult])
  return {
    sink$: intent$.filter(supTypeSameAs(injector))
      .tap(compose(console.log)(interpretExpr(printer)))
      .map(interpretExpr(interpreter)),
    inc: () => over(lit('count'), mult(add(lit(1)))),
  }
})
const Counter = counterable(CounterView)
const Counter2 = multable(CounterView)
render(
    <Most>
    <div>
    <Counter />
    <Counter2 />
    </div>

  </Most>
  , document.getElementById('app'));
