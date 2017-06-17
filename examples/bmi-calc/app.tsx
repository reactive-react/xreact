import * as React from 'react';
import { render } from 'react-dom';
import * as RX from '../../src/xs/rx'
import X from '../../src/x'
import { pure, liftCombine } from '../../src/fantasy'
import { Actions } from '../../src/interfaces'
interface Change extends Event {
  type: string
  target: HTMLInputElement
}
type Intent = Change
interface BMIState {
  bmi: string
  health: string
}
interface BMIProps<I> extends BMIState {
  actions: Actions<I>;
}
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

interface InputState {
  value: number
}
const planx = name => (intent$) => {
  return {
    update$: intent$.filter(i => i.type == 'change' && i.target.name == name)
      .map(i => parseFloat(i.target.value))
      .map(value => (() => ({ value })))
  }
}
const weightx = pure<RX.URI, Intent, InputState>(planx('weight'))

const heightx = pure<RX.URI, Intent, InputState>(planx('height'))

const BMIx = liftCombine<RX.URI, Intent, InputState, InputState, BMIState>(
  (u1, u2) => ((state) => {
    let bmi = u1().value / (u2().value * u2().value)
    let health = '...'
    if (bmi < 18.5) health = 'underweight'
    else if (bmi < 24.9) health = 'normal'
    else if (bmi < 30) health = 'Overweight'
    else if (bmi >= 30) health = 'Obese'
    return { bmi: bmi.toString(), health }
  }))
  (weightx, heightx)

const BMI = BMIx.apply(View)

// BMIx is compose from weightx and heightx

// while weightx and heightx can be still use to create another component
const Weight = weightx.apply(props => props.value ? <p>where height is {props.value} kg</p> : null)
const Height = heightx.apply(props => props.value ? <p>and {props.value}m height</p> : null)
render(
  <X x={RX}>
    <form>
      <BMI />
      <Weight />
      <Height />
    </form>
  </X>
  , document.getElementById('app'));
