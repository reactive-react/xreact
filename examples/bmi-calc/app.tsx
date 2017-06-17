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
}
interface BMIProps<I> extends BMIState {
  actions: Actions<I>;
}
const View: React.SFC<BMIProps<Intent>> = props => (
  <div>
    <input type="number" name="weight" defaultValue="0" onChange={props.actions.fromEvent} />
    <input type="number" name="height" defaultValue="0" onChange={props.actions.fromEvent} />
    <span>{props.bmi}</span>
  </div>
)
View.defaultProps = { bmi: '.......' }

interface InputState {
  value: number
}
const weightx = pure<RX.URI, Intent, InputState>(
  (intent$) => {
    return {
      update$: intent$.filter(i => i.type == 'change' && i.target.name == 'weight')
        .map(i => parseFloat(i.target.value))
        .map(value => (() => ({ value })))
    }
  }
)

const heightx = pure<RX.URI, Intent, InputState>(
  (intent$) => {
    return {
      update$: intent$.filter(i => i.type == 'change' && i.target.name == 'height')
        .map(i => parseFloat(i.target.value))
        .map(value => (() => ({ value })))
    }
  }
)

const BMIx = liftCombine<RX.URI, Intent, InputState, InputState, BMIState>(
  (u1, u2) => ((state) => {
    let bmi = u1().value / (u2().value * u2().value)
    let health = '...'
    if (bmi < 18.5) health = 'underweight'
    else if (bmi < 24.9) health = 'normal'
    else if (bmi < 30) health = 'Overweight'
    else if (bmi >= 30) health = 'Obese'
    return { bmi: health }
  }))
  (weightx, heightx)

const BMI = BMIx.apply(View)

render(
  <X x={RX}>
    <BMI />
  </X>
  , document.getElementById('app'));
