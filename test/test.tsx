import {pure, lift2, X, xinput, fromEvent, traverse} from '../src'
import * as React from 'react';
import { render } from 'react-dom';
import * as RX from '../src/xs/rx'
function xmount(component, dom) {render(React.createFactory(X)({ x: RX }, component), dom)}

let Xeg1 = lift2((x:number,y: number) => x * y)(pure(6), pure(5))
let ViewEg1 = props => <p>{props.product}</p>
let Eg1 = Xeg1.map(a=>({product: a})).apply(ViewEg1)

xmount(<Eg1/>, document.getElementById('eg1') )

let Xeg2 = lift2((x:number,y: number) => x * y)(fromEvent('change', 'n1', '5').map(x=>~~x), fromEvent('change', 'n2', '6').map(x=>~~x))
let ViewEg2 = props => <section>
  <p><input type="number" name="n1" onChange={props.actions.fromEvent} defaultValue="5"/></p>
  <p><input type="number" name="n2" onChange={props.actions.fromEvent} defaultValue="6"/></p>
  <p>{props.product}</p>
</section>
let Eg2 = Xeg2.map(a=>({product: a})).apply(ViewEg2)

xmount(<Eg2/>, document.getElementById('eg2') )

let Xeg3 = fromEvent('change', 'string1', 'Jichao')
.concat(pure(' '))
.concat(fromEvent('change', 'string2', 'Ouyang'))

let ViewEg3 = props => <section>
  <p><input type="text" name="string1" onChange={props.actions.fromEvent} /></p>
  <p><input type="text" name="string2" onChange={props.actions.fromEvent} /></p>
  <p>{props.semigroup}</p>
</section>

let Eg3 = Xeg3.map(a=>({semigroup: a})).apply(ViewEg3)

xmount(<Eg3/>, document.getElementById('eg3') )

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
  {list.map((item, index) => (<p key={index} >
    <input type="number" name={"traverse" + index} onChange={props.actions.fromEvent} defaultValue={item} />
  </p>))
  }
  <p>{props.sum}</p>
</section>

let Eg4 = Xeg4.map(a=>({sum: a})).apply(ViewEg4)

xmount(<Eg4/>, document.getElementById('eg4') )

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
    <p>BMI: <span>{props.bmi}</span></p>
  </div>
)

let Eg5 = Xeg5.apply(ViewEg5)

xmount(<Eg5/>, document.getElementById('eg5') )
