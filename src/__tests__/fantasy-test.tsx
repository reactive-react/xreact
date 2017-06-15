import * as React from 'react';
import { mount } from 'enzyme';
import '@reactivex/rxjs'
import X from '../x';
import { Plan } from '../interfaces'
import { pure, map, lift2 } from '../fantasy'
import * as rx from '../xs/rx'
import { Observable } from '@reactivex/rxjs'
import '@reactivex/rxjs/dist/cjs/add/observable/combineLatest'
import '@reactivex/rxjs/dist/cjs/add/operator/filter'
import * as createClass from 'create-react-class'
import { rx as Xtest } from '../xtests'
import * as _ from 'lodash/fp'
const compose = (f, g) => x => f(g(x));


const CounterView: React.SFC<any> = props => (
  <div className="counter-view">
    <span className="count">{props.count}</span>
  </div>
)

CounterView.defaultProps = { count: 0 }

interface Intent {
  type: string
  value?: any
}
let mountx = compose(mount, y => React.createFactory(X)({ x: rx }, y))

const fantasyX = pure<rx.URI, Intent, any>((intent$) => {
  return {
    update$: intent$.map((intent) => {
      switch (intent.type) {
        case 'inc':
          return state => ({ count: state.count + 1 })
        case 'dec':
          return state => ({ count: state.count - 1 })
        default:
          return state => state
      }
    }),
    actions: {
      inc: () => ({ type: 'inc' }),
      dec: () => ({ type: 'dec' }),
    }
  }
})

describe('actions', () => {
  let Counter, counterWrapper, counter, t, counterView, actions
  describe('basic', () => {
    beforeEach(() => {
      Counter = fantasyX.apply(CounterView)
      counterWrapper = mountx(<Counter />)
      counter = counterWrapper.find(Counter).getNode()
      counterView = counterWrapper.find(CounterView)
      actions = counterView.prop('actions')
      t = new Xtest();
    })
    it('add intent to intent$ and go through sink$', () => {
      return t
        .do([
          actions.inc,
          actions.inc,
          actions.inc,
        ])
        .collect(counter)
        .then(x => expect(x.count).toBe(3))
    })
  })
  describe('map', () => {
    beforeEach(() => {
      let newPlan = plan => intent$ => ({
        update$: plan(intent$).update$.map(f => compose(f, f)),
        actions: {
          inc: () => ({ type: 'inc' }),
        }
      })
      Counter = fantasyX.map(plan => newPlan(plan)).apply(CounterView)
      counterWrapper = mountx(<Counter />)
      counter = counterWrapper.find(Counter).getNode()
      counterView = counterWrapper.find(CounterView)
      actions = counterView.prop('actions')
      t = new Xtest();
    })
    it('inc will + 2', () => {
      return t
        .do([
          actions.inc,
          actions.inc,
          actions.inc,
        ])
        .collect(counter)
        .then(x => expect(x.count).toBe(6))
    })
  })

  describe('lift2', () => {
    let input1
    beforeEach(() => {
      function plus(p1: Plan<rx.URI, Intent, any>, p2: Plan<rx.URI, Intent, any>) {
        return function(intent$) {
          let machine1 = p1(intent$),
            machine2 = p2(intent$)
          let update$ = Observable.combineLatest(
            machine1.update$,
            machine2.update$,
            (s1, s2) => (state => ({ sum: s1(state).value + s2(state).value }))
          )
          return { actions, update$ }
        }
      }
      let fantasyX1 = pure<rx.URI, Intent, any>(intent$ => {
        return {
          update$: intent$.filter(i => i.type == 'change1')
            .map(i => state => ({ value: i.value }))
        }
      })

      let fantasyX2 = pure<rx.URI, Intent, any>(intent$ => {
        return {
          update$: intent$.filter(i => i.type == 'change2')
            .map(i => state => ({ value: i.value }))
        }
      })

      let View: React.SFC<any> = props => (
        <div>
          <span className="count">{props.sum}</span>
        </div>
      )

      View.defaultProps = { sum: 0, value: 0 }

      Counter = lift2<rx.URI, Intent, any, any, any>(plus)(fantasyX1, fantasyX2).apply(View)

      counterWrapper = mountx(<Counter />)
      counter = counterWrapper.find(Counter).getNode()
      counterView = counterWrapper.find(View)
      input1 = counterView.find('#input1')
      actions = counterView.prop('actions')
      t = new Xtest();
    })
    it.only('inc will + 2', () => {
      return t
        .do([
          () => actions.fromEvent({ type: 'change1', value: 3 }),
          () => actions.fromEvent({ type: 'change2', value: 10 })

        ])
        .collect(counter)
        .then(x => expect(x.sum).toBe(13))
    })
  })
})
