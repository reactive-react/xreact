import {pure, lift2, X, xinput, fromEvent} from '../src'
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
