import * as React from 'react';
import { render } from 'react-dom';
import * as RX from '../../lib/xs/rx'
import { X, xinput, lift2, Actions } from '../..'

// Types
interface Intent extends Event { }

interface BMIState {
  value: number
  weight: number
  height: number
  bmi: string
  health: string
}

interface BMIProps<I> extends BMIState {
  actions: Actions<I>;
}

// View
const View: React.SFC<BMIProps<Intent>> = props => (
  <div>
    <label>
      weight(kg):
      <input type="number" name="weight" defaultValue="0" onChange={props.actions.fromEvent} />
    </label>
    <label>
      height(m):
      <input type="number" name="height" defaultValue="0" onChange={props.actions.fromEvent} />
    </label>
    <p>Your BMI is <b>{props.bmi}</b></p>
    <p>which means you're <b>{props.health}</b></p>
  </div>
)

View.defaultProps = { bmi: '', health: '' }

// Plan
const weightx = xinput<'number', RX.URI, Intent, BMIState>('weight')

const heightx = xinput<'number', RX.URI, Intent, BMIState>('height')

const BMIx = lift2<RX.URI, Intent, BMIState>(
  (s1, s2) => {
    let bmi = 0
    let health = '...'
    if (s1.weight && s2.height) {
      bmi = s1.weight / (s2.height * s2.height)
    }
    if (bmi < 18.5) health = 'underweight'
    else if (bmi < 24.9) health = 'normal'
    else if (bmi < 30) health = 'Overweight'
    else if (bmi >= 30) health = 'Obese'
    return { bmi: bmi.toString(), health }
  })
  (weightx, heightx)

const BMI = BMIx.apply(View)

// BMIx is compose from weightx and heightx

// while weightx and heightx can be still use to create another component
const Weight = weightx.apply(props => props.weight ? <p>where weight is {props.weight} kg</p> : null)
const Height = heightx.apply(props => props.height ? <p>and {props.height}m height</p> : null)
render(
  <X x={RX}>
    <form>
      <BMI />
      <Weight />
      <Height />
    </form>
  </X>
  , document.getElementById('app'));
