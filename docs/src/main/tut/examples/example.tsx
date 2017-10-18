import * as React from 'react';
import { render } from 'react-dom';
import '../../../../../src/xs/rx'
import { Applicative, lift2,Semigroup, Functor, map } from '../../../../../src/fantasy'
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
