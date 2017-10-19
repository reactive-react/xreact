import * as React from 'react';
import { render } from 'react-dom';
import '../../../../../src/xs/rx'
import { Applicative, lift2,Semigroup, Functor, map, Traversable, FlatMap } from '../../../../../src/fantasy'
import {X} from '../../../../../src'
function xmount(component, dom) { render(React.createFactory(X)({}, component), dom) }

let mult = (x:number,y: number) => x * y
let Xeg1 = lift2<"FantasyX",number, number, number>(mult)(Applicative.FantasyX.pure(6), Applicative.FantasyX.pure(5))

let ViewEg1 = props => <p className="result">{props.product}</p>

let Eg1 = Functor.FantasyX.map(a=>({product: a}), Xeg1).apply(ViewEg1)

xmount(<Eg1/>, document.getElementById('eg1') )

import {Xstream} from '../../../../../src/fantasy/xstream';

function strToInt(x) {return ~~x}
type Intent = {type:string, value:number}
let XSinput1 = Xstream.fromEvent('change', 'n1', '5')
let XSinput2 = Xstream.fromEvent('change', 'n2', '6')

let Xeg2 = lift2<"Xstream", number, number, number>(mult)(
  Functor.Xstream.map(strToInt, XSinput1),
  Functor.Xstream.map(strToInt, XSinput2)
).toFantasyX()
    .map(x=>({product: x}))

let ViewEg2 = props => <section>
    <p><input type="number" name="n1" onChange={props.actions.fromEvent} defaultValue="5"/></p>
    <p><input type="number" name="n2" onChange={props.actions.fromEvent} defaultValue="6"/></p>
    <p><span className="result">{props.product}</span></p>
    </section>

let Eg2 = Xeg2.apply(ViewEg2)

xmount(<Eg2/>, document.getElementById('eg2') )

let Xeg3 = Semigroup.Xstream.concat(
  Semigroup.Xstream.concat(
    Xstream.fromEvent('change', 'firstName', 'Jichao'),
    Applicative.Xstream.pure(' ')
  ),
  Xstream.fromEvent('change', 'lastName', 'Ouyang')
).toFantasyX()
let ViewEg3 = props => <section>
    <p><input type="text" name="firstName" onChange={props.actions.fromEvent} defaultValue="Jichao" /></p>
    <p><input type="text" name="lastName" onChange={props.actions.fromEvent} defaultValue="Ouyang"/></p>
    <p><span className="result">{props.semigroup}</span></p>
    </section>

let Eg3 = Xeg3.map(a=>({semigroup: a})).apply(ViewEg3)

xmount(<Eg3/>, document.getElementById('eg3') )

function sum(list){
  return list.reduce((acc,x)=> acc+x, 0)
}
let list = ['1', '2', '3', '4', '5', '6', '7']
let Xeg4 = Traversable.Array.traverse<'Xstream', string, string>('Xstream')(
    (defaultVal, index) => (Xstream.fromEvent('change', 'traverse' + index, defaultVal)),
    list
).toFantasyX()
    .map(xs => xs.map(strToInt))
    .map(sum)

let ViewEg4 = props => <section>
{list.map((item, index) => (<p>
<input key={index} type="number" name={"traverse" + index} onChange={props.actions.fromEvent} defaultValue={item} />
</p>))
}
  <p><span className="result">{props.sum}</span></p>
</section>

let Eg4 = Xeg4.map(a=>({sum: a})).apply(ViewEg4)

xmount(<Eg4/>, document.getElementById('eg4') )

function bmiCalc(weight, height) {
  return fetch(`https://gist.github.com.ru/jcouyang/edc3d175769e893b39e6c5be12a8526f?height=${height}&weight=${weight}`)
    .then(resp => resp.json())
    .then(json => json.result)
}

let xweigth = Xstream.fromEvent('change', 'weight', '70')
let xheight = Xstream.fromEvent('change', 'height', '175')

let promiseXstream = lift2<"Xstream", string, string, Promise<any>>(bmiCalc)(
  xweigth,
  xheight
)

let Xeg5 = FlatMap.Xstream.flatMap(Xstream.fromPromise, promiseXstream)
    .toFantasyX()

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

xmount(<Eg5/>, document.getElementById('eg5') )

let Xeg6 = Xstream.fromEvent('click', 'increment')
    .toFantasyX<{count:number}>()
    .map(x => 1)
    .foldS((acc, a) => {
      return { count: (acc.count||0) + a }})

let ViewEg6 = props => <p>
    <span className="result">{props.count || 0}</span>
    <input type="button" name="increment" value="+1" onClick={e=>props.actions.fromEvent(e)} />
    </p>

let Eg6 = Xeg6.apply(ViewEg6)

xmount(<Eg6/>, document.getElementById('eg6') )

let Xeg7 = Xstream.fromEvent('click', 'decrement')
      .toFantasyX<{count:number}>()
      .map(x => -1)
      .foldS((acc, a) => {
        return { count: (acc.count||0) + a }})

  let ViewEg7 = props => <p>
      <input type="button" name="decrement" value="-" onClick={e=>props.actions.fromEvent(e)} />
      <span className="result">{props.count || 0}</span>
      <input type="button" name="increment" value="+" onClick={e=>props.actions.fromEvent(e)} />
  </p>

  let Eg7 = Xeg7.merge(Xeg6).apply(ViewEg7)

xmount(<Eg7/>, document.getElementById('eg7') )

const actions = ['-1', '+1', 'reset']
let Xeg8 =
  actions.map((action)=>Xstream.fromEvent('click', action).toFantasyX<{count:number}>())
    .reduce((acc,a)=>acc.merge(a))
    .foldS((acc, i) => {
    acc.count = acc.count || 0
      switch(i) {
      case '-1': return {count: acc.count -1}
      case '+1': return {count: acc.count +1}
      case 'reset': return {count: 0}
      default: acc
      }
    }
)

let ViewEg8 = props => <p>
  <span className="result">{props.count}</span>
  {actions.map(action=>
    <input type="button" name={action} value={action} onClick={e=>props.actions.fromEvent(e)} />)}
</p>

let Eg8 = Xeg8.apply(ViewEg8)

xmount(<Eg8/>, document.getElementById('eg8') )
