import * as React from 'react';
import { mount } from 'enzyme';
import '@reactivex/rxjs'
import X, { x } from '../x';
import * as RX from '../xs/rx'
import { Observable } from '@reactivex/rxjs'
import { StaticStream } from '../xs'
import * as createClass from 'create-react-class'
import Xtest from '../xtest'
const compose = (f, g) => x => f(g(x));
const mountx = compose(mount, x => React.createFactory(X)({ x: RX }, x))

const CounterView: React.SFC<any> = props => (
  <div className="counter-view">
    <span className="count">{props.count}</span>
  </div>
)

CounterView.defaultProps = { count: 0, overwritedProps: 'inner' }
interface Intent {
  type: string
  value?: any
}

const xcountable = x<RX.URI, Intent, any>((intent$) => {
  return {
    update$: intent$.map((intent) => {
      switch (intent.type) {
        case 'inc':
          return state => ({ count: state.count + 1 })
        case 'dec':
          intent$.next({ type: 'abs' })
          return state => ({ count: state.count - 1 })
        case 'abs':
          return state => ({ count: Math.abs(state.count) })
        case 'changeWrapperProps':
          return state => ({
            wrapperProps: intent.value,
            overwritedProps: intent.value
          })
        case 'changeDefaultProps':
          return state => ({ count: intent.value })
        case 'exception':
          throw new Error('exception!!!')
        default:
          return state => state
      }
    }),
    actions: {
      inc: () => ({ type: 'inc' }),
      dec: () => ({ type: 'dec' }),
      exception: () => ({ type: 'exception' }),
      changeWrapperProps: (value) => ({ type: 'changeWrapperProps', value }),
      changeDefaultProps: (value) => ({ type: 'changeDefaultProps', value }),
    }
  }
})

let Counter = xcountable(CounterView)
describe('X', () => {
  describe('actions', () => {
    let counterWrapper, counter, t, counterView, actions
    beforeEach(() => {
      counterWrapper = mountx(<Counter />)
      counter = counterWrapper.find(Counter).getNode()
      counterView = counterWrapper.find(CounterView)
      actions = counterView.prop('actions')
      t = new Xtest(counterView.props());
    })
    it('add intent to intent$ and go through sink$', () => {
      return t.plan(3)
        .do([
          actions.inc,
          actions.inc,
          actions.inc
        ])
        .collect(counter)
        .then(x => expect(x.count).toBe(3))
    })

    it('async action', () => {
      return t.plan(3)
        .do([
          actions.inc,
          () => actions.fromEvent({ type: 'inc' }),
          () => actions.fromPromise(Promise.resolve({ type: 'inc' }))
        ])
        .collect(counter)
        .then(state => expect(state.count).toBe(3))
    })

    it('update can also generate new intent', () => {
      return new Xtest({ count: -3 }).plan(3)
        .do([
          counter.machine.actions.dec
        ]).collect(counter)
        .then(state => expect(state.count).toBe(2))
    })
  });

  describe('props', () => {
    let counterWrapper, counter, t, counterView, actions
    beforeEach(() => {
      counterWrapper = mountx(
        <Counter count={9} />
      )
      counter = counterWrapper.find(Counter).getNode()
      counterView = counterWrapper.find(CounterView)
      actions = counterView.prop('actions')
      t = new Xtest(counterView.props());
    })
    it('wrappers props will overwirte components default props', () => {
      return t.plan(1)
        .do([
          counter.machine.actions.inc
        ]).collect(counter)
        .then(state => expect(state.count).toBe(10))
    })
  })

  describe('scope', () => {
    let counterWrapper, counter, t, counterView, actions
    beforeEach(() => {
      counterWrapper = mountx(
        <Counter count={0} wrapperProps={0} overwritedProps={0} />
      )
      counter = counterWrapper.find(Counter)
      counterView = counterWrapper.find(CounterView)
      actions = counterView.prop('actions')
      t = new Xtest(counterView.props());
    })
    it('like scope in function, outter component change overwrited props wont works', () => {
      return t.plan(1)
        .do([
          () => actions.changeDefaultProps(19),
          () => counterWrapper.setProps({ wrapperProps: 1, overwritedProps: 1, count: 9 })
        ]).collect(counter.getNode())
        .then(() => expect(counterView.prop('wrapperProps')).toBe(0))
        .then(() => expect(counterView.prop('overwritedProps')).toBe('inner'))
        .then(() => expect(counterView.prop('count')).toBe(19))
    })
  })

  describe('composable', () => {
    let counterWrapper, counter, t, counterView, actions
    const xxcountable = x<RX.URI, Intent, any>((intent$) => {
      return {
        update$: intent$.map(intent => {
          switch (intent.type) {
            case 'inc2':
              return state => ({ count: state.count + 2 })
            case 'dec2':
              return state => ({ count: state.count - 2 })
            default:
              return state => state
          }
        }),
        actions: {
          inc2: () => ({ type: 'inc2' }),
          dec2: () => ({ type: 'dec2' }),
        }
      }
    })
    let xxxcoutable = compose(xxcountable, xcountable)
    beforeEach(() => {
      Counter = xxxcoutable(CounterView)
      counterWrapper = mountx(
        <Counter />
      )
      counter = counterWrapper.find(Counter).getNode()
      counterView = counterWrapper.find(CounterView)
      actions = counterView.prop('actions')
      t = new Xtest(counterView.props());
    })
    it('compose xxcountable will provide actions inc2, dec2', () => {
      return t.plan(6)
        .do([
          actions.inc,
          actions.inc2,
          actions.dec2,
        ]).collect(counter)
        .then(state => expect(state.count).toBe(1))
    })
  })

  describe('ERROR', () => {
    let counterWrapper, counter, t, counterView, actions
    beforeEach(() => {
      spyOn(console, 'error')
      counterWrapper = mountx(
        <Counter />
      )
      counter = counterWrapper.find(Counter).getNode()
      counterView = counterWrapper.find(CounterView)
      actions = counterView.prop('actions')
      t = new Xtest(counterView.props());
    })

    it('should recover to identity stream and log exception', () => {
      return t.plan(3)
        .do([
          actions.inc,
          actions.exception,
          actions.inc
        ]).collect(counter)
        .then(state => expect(state.count).toBe(2))
        .then(() => expect(console.error).toBeCalled)

    })
  })

  describe('unsubscribe when component unmounted', () => {
    it('unsubscribe', (done) => {
      const Counter = x<RX.URI, Intent, any>((intent$) => {
        let incForever$ = Observable.interval(100).map(n => {
          done.fail('should not next intent any more')
          return _ => ({ count: 'should not next intent any more' })
        })
        return {
          update$: intent$.map(intent => {
            switch (intent.type) {
              case 'inc':
                return state => ({ count: state.count + 1 })
              default:
                return state => state
            }
          }).merge(incForever$)
        }
      })(CounterView)

      const TogglableMount = createClass({
        getInitialState() {
          return {
            mount: true
          }
        },
        render() {
          return this.state.mount && <Counter history={true} />
        }
      })
      spyOn(console, 'error')
      let counterWrapper = mountx(
        <TogglableMount />
      )
      let toggle = counterWrapper.find(TogglableMount)
      let counter = counterWrapper.find(Counter)
      toggle.getNode().setState({ mount: false })
      done()
    })
  })
})
