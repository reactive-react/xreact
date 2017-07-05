import * as React from 'react';
import { mount } from 'enzyme';
import '@reactivex/rxjs'
import X from '../x';
import { Plan } from '../interfaces'
import { pure, map, lift2, lift, lift3, lift4, lift5, concat } from '../fantasy'
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
interface CountProps {
  count: number
}

let mountx = compose(mount, y => React.createFactory(X)({ x: rx }, y))

const fantasyX = pure<rx.URI, Intent, CountProps>((intent$) => {
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
      Counter = fantasyX.map(a => (
        { count: (a.count || 0) * 2 }
      ))
        .apply(CounterView)

      counterWrapper = mountx(<Counter />)
      counter = counterWrapper.find(Counter).getNode()
      counterView = counterWrapper.find(CounterView)
      actions = counterView.prop('actions')
      t = new Xtest();
    })
    it('inc will + 1 then * 2', () => {
      return t
        .do([
          actions.inc,
          actions.inc,
          actions.inc,
        ])
        .collect(counter)
        .then(x => expect(x.count).toBe(14))
    })
  })

  describe('bimap', () => {
    beforeEach(() => {
      Counter = fantasyX.bimap(
        () => ({
          double: () => ({ type: 'double' }),
          inc: () => ({ type: 'inc' })
        }),
        a => (
          { count: (a.count || 0) * 2 }
        ))
        .apply(CounterView)

      counterWrapper = mountx(<Counter />)
      counter = counterWrapper.find(Counter).getNode()
      counterView = counterWrapper.find(CounterView)
      actions = counterView.prop('actions')
      t = new Xtest();
    })
    it('inc will + 1 then * 2, otherwise * 2', () => {
      return t
        .do([
          actions.inc, // (0 + 1) * 2 = 2
          actions.double, // 2 * 2 = 4
          actions.inc, // (4 + 1) * 2 = 10
        ])
        .collect(counter)
        .then(x => expect(x.count).toBe(10))
    })
  })

  describe('lift', () => {
    beforeEach(() => {
      Counter = lift<rx.URI, Intent, CountProps>(a => (
        { count: (a.count || 0) * 2 }
      ))(fantasyX).apply(CounterView)

      counterWrapper = mountx(<Counter />)
      counter = counterWrapper.find(Counter).getNode()
      counterView = counterWrapper.find(CounterView)
      actions = counterView.prop('actions')
      t = new Xtest();
    })
    it('inc will + 1 then * 2', () => {
      return t
        .do([
          actions.inc,
          actions.inc,
          actions.inc,
        ])
        .collect(counter)
        .then(x => expect(x.count).toBe(14))
    })
  })
  describe('concat', () => {
    let fantasyXB;
    beforeEach(() => {
      fantasyXB = pure<rx.URI, Intent, CountProps>((intent$) => {
        return {
          update$: intent$.map((intent) => {
            switch (intent.type) {
              case 'double':
                return state => ({ count: state.count * 2 })
              case 'half':
                return state => ({ count: state.count / 2 })
              default:
                return state => state
            }
          }),
          actions: {
            double: () => ({ type: 'double' }),
            half: () => ({ type: 'half' }),
          }
        }
      })
      Counter = concat<rx.URI, Intent, CountProps>(fantasyX, fantasyXB).apply(CounterView)

      counterWrapper = mountx(<Counter />)
      counter = counterWrapper.find(Counter).getNode()
      counterView = counterWrapper.find(CounterView)
      actions = counterView.prop('actions')
      t = new Xtest();
    })
    it('should able to inc,dec,half  and double', () => {
      return t
        .do([
          actions.inc,
          actions.inc,
          actions.double,
          actions.dec,
          actions.double,
          actions.inc,
          actions.half
        ])
        .collect(counter)
        .then(x => expect(x.count).toBe(3.5))
    })
  })
  describe('combine', () => {
    let input1
    beforeEach(() => {
      let fantasyX1 = pure<rx.URI, Intent, ViewProps>(intent$ => {
        return {
          update$: intent$.filter(i => i.type == 'change1')
            .map(i => state => ({ value0: i.value }))
        }
      })

      let fantasyX2 = pure<rx.URI, Intent, any>(intent$ => {
        return {
          update$: intent$.filter(i => i.type == 'change2')
            .map(i => state => ({ value1: i.value }))
        }
      })

      let View: React.SFC<any> = props => (
        <div>
          <span className="count">{props.sum}</span>
        </div>
      )

      View.defaultProps = { sum: 0, value0: 0, value1: 0 }

      interface ViewProps {
        sum: number,
        value0: number,
        value1: number
      }

      Counter = lift2<rx.URI, Intent, ViewProps>(
        (s1, s2) => ({ sum: (s1.value0 || 0) + (s2.value1 || 0) })
      )(fantasyX1, fantasyX2).apply(View)

      counterWrapper = mountx(<Counter />)
      counter = counterWrapper.find(Counter).getNode()
      counterView = counterWrapper.find(View)
      input1 = counterView.find('#input1')
      actions = counterView.prop('actions')
      t = new Xtest();
    })
    it('inc will + 2', () => {
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

describe('liftN', () => {
  let Fa, stub, CounterView: React.SFC<any>

  beforeEach(() => {
    let fan = [1, 2, 3, 4, 5];
    Fa = fan.map(i => pure<rx.URI, Intent, CountProps>(intent$ => {
      return {
        update$: Observable.of(state => ({ count: i })),
        actions: {
          ['action' + i]: () => ({ type: 'action' + i })
        }
      }
    }))
    stub = jest.fn()
    CounterView = props => {
      stub(props)
      return (<div />)
    }

    CounterView.defaultProps = { count: 0 }
  })

  describe('#lift3', () => {
    beforeEach(() => {
      let Counter = lift3<rx.URI, Intent, CountProps>((s1, s2, s3) => {
        return { count: ((s1.count || 0) + (s2.count || 0) + (s3.count || 0)) }
      })(Fa[0], Fa[1], Fa[2]).apply(CounterView)
      mountx(<Counter />)
    })

    it('should sum all 3 FantasyX', () => {
      expect(stub.mock.calls[1][0].count).toEqual(6)
    })
  })

  describe('#lift4', () => {
    beforeEach(() => {
      let Counter = lift4<rx.URI, Intent, CountProps>((s1, s2, s3, s4) => {
        return {
          count: ((s1.count || 0) +
            (s2.count || 0) +
            (s3.count || 0)) +
          (s4.count || 0)
        }
      })(Fa[0], Fa[1], Fa[2], Fa[3]).apply(CounterView)
      mountx(<Counter />)
    })

    it('should sum all 3 FantasyX', () => {
      expect(stub.mock.calls[1][0].count).toEqual(10)
    })
  })

  describe('#lift5', () => {
    beforeEach(() => {
      let Counter = lift5<rx.URI, Intent, CountProps>((s1, s2, s3, s4, s5) => {
        return {
          count: ((s1.count || 0) +
            (s2.count || 0) +
            (s3.count || 0) +
            (s4.count || 0) +
            (s5.count || 0)
          )
        }
      })(Fa[0], Fa[1], Fa[2], Fa[3], Fa[4]).apply(CounterView)
      mountx(<Counter />)
    })

    it('should sum all 3 FantasyX', () => {
      expect(stub.mock.calls[1][0].count).toEqual(15)
    })
  })
})
