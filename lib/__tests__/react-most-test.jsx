import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import * as most from 'most';

import Most, {connect} from '../../dist/react-most';
import {stateStreamOf, stateHistoryOf,
        intentStreamOf, intentHistoryOf,
        run, dispatch,
        Engine } from 'react-most-spec';
const compose = f => g => x => g(f(x));

const CounterView = React.createClass({
  render(){
    return (
      <div>
        <span className="count">{this.props.count}</span>
        <span className="wrapperProps">{this.props.wrapperProps}</span>
        <span className="overwritedProps">{this.props.overwritedProps}</span>
        <span className="backward" onClick={this.props.history.backward}>-</span>
        <span className="forward" onClick={this.props.history.forward}>+</span>
      </div>
    )
  }
})

CounterView.defaultProps = {count: 0, overwritedProps: 'inner'}

const counterWrapper = connect(intent$=>{
  return {
    updates: intent$.map(intent=>{
      switch(intent.type) {
        case 'inc': return state=>({count:state.count+1})
        case 'dec':
          intent$.send({type:'dec triggered'})
          return state=>({count:state.count-1})
        case 'changeWrapperProps':
          return state=>({wrapperProps: intent.value,
                          overwritedProps: intent.value})
        case 'changeDefaultProps':
          return state=>({count: intent.value})
        default:
          return state=>state
      }
    }),
    actions:{
      inc: ()=>({type:'inc'}),
      dec: ()=>({type:'dec'}),
      changeWrapperProps: (value)=>({type:'changeWrapperProps', value}),
      changeDefaultProps: (value)=>({type:'changeDefaultProps', value}),
    }
  }
})

const Counter = counterWrapper(CounterView)

describe('react-most', () => {
  describe('actions', ()=>{
    it.only('add intent to intent$ and go through sink$', ()=> {
      let counterWrapper = TestUtils.renderIntoDocument(
        <Most engine={Engine}>
          <Counter history={true} />
        </Most>
      )
      let counter = TestUtils.findRenderedComponentWithType(counterWrapper, Counter)
      counter.actions.inc()
      counter.actions.inc()
      counter.actions.inc()
      console.log(stateHistoryOf(counter));
      expect(stateHistoryOf(counter)[2].count).toBe(3)
    })

    it('async action', ()=> {
      let counterWrapper = TestUtils.renderIntoDocument(
        <Most engine={Engine}>
          <Counter history={true} />
        </Most>
      )
      let counter = TestUtils.findRenderedComponentWithType(counterWrapper, Counter)
      counter.actions.inc();
      counter.actions.fromEvent({type:'inc'});
      return counter.actions.fromPromise(Promise.resolve({type:'inc'}))
                    .then(()=>{
                      expect(stateHistoryOf(counter)[2].count).toBe(3)
                    })

    })

    it('sink can also generate intent', ()=> {
      let counterWrapper = TestUtils.renderIntoDocument(
        <Most engine={Engine}>
          <Counter history={true} />
        </Most>
      )
      let counter = TestUtils.findRenderedComponentWithType(counterWrapper, Counter)

      counter.actions.dec()
      expect(intentHistoryOf(counter)[1].type).toBe('dec triggered')
    })

    it('props will overwirte components default props', ()=>{
      let counterWrapper = TestUtils.renderIntoDocument(
        <Most engine={Engine} >
          <Counter count={9} history={true} />
        </Most>
      )
      let counter = TestUtils.findRenderedComponentWithType(counterWrapper, Counter)
      counter.actions.inc();
      expect(stateHistoryOf(counter)[0].count).toBe(10)
    })

    it('props that not overlap with views defaultProps can not be changed', ()=>{
      let CounterWrapper = React.createClass({
        getInitialState(){
          return {
            wrapperProps: 'heheda',
            overwritedProps: 'hoho',
            count: 0,
          }
        },
        render(){
          return <Counter
                     count={this.state.count}
                     wrapperProps={this.state.wrapperProps}
                     overwritedProps={this.state.overwritedProps}
                     history={true} />
        }
      })
      let counterMostWrapper = TestUtils.renderIntoDocument(
        <Most engine={Engine}>
          <CounterWrapper />
        </Most>
      )
      let counterWrapper = TestUtils.findRenderedComponentWithType(counterMostWrapper, CounterWrapper)
      let counter = TestUtils.findRenderedComponentWithType(counterWrapper, Counter)
      counter.actions.changeWrapperProps('miao')
      counter.actions.changeDefaultProps(19)
      let wrapperProps = TestUtils.findRenderedDOMComponentWithClass(counter, 'wrapperProps')
      let overwritedProps = TestUtils.findRenderedDOMComponentWithClass(counter, 'overwritedProps')
      let count = TestUtils.findRenderedDOMComponentWithClass(counter, 'count')
      expect(counter.props.wrapperProps).toBe('heheda')
      expect(wrapperProps.textContent).toBe('miao')
      expect(overwritedProps.textContent).toBe('miao')
      expect(count.textContent).toBe('19')
      counterWrapper.setState({overwritedProps: 'wrapper', count: 1})
      overwritedProps = TestUtils.findRenderedDOMComponentWithClass(counter, 'overwritedProps')
      count = TestUtils.findRenderedDOMComponentWithClass(counter, 'count')
      expect(overwritedProps.textContent).toBe('wrapper')
      expect(count.textContent).toBe('1')
    })
  });

  describe('history', ()=>{
    it('can undo', ()=> {
      let counterWrapper = TestUtils.renderIntoDocument(
        <Most engine={Engine} >
          <Counter history={true} />
        </Most>
      )
      let counter = TestUtils.findRenderedComponentWithType(counterWrapper, Counter)
      counter.actions.inc()
      counter.actions.inc()
      counter.actions.inc()
      let backward = TestUtils.findRenderedDOMComponentWithClass(counterWrapper, 'backward')
      TestUtils.Simulate.click(backward)
      TestUtils.Simulate.click(backward)
      TestUtils.Simulate.click(backward)
      let count = TestUtils.findRenderedDOMComponentWithClass(counterWrapper, 'count')
      expect(count.textContent).toBe('1')
      let forward = TestUtils.findRenderedDOMComponentWithClass(counterWrapper, 'forward')
      TestUtils.Simulate.click(forward)
      count = TestUtils.findRenderedDOMComponentWithClass(counterWrapper, 'count')
      expect(count.textContent).toBe('2')
      forward = TestUtils.findRenderedDOMComponentWithClass(counterWrapper, 'forward')
      TestUtils.Simulate.click(forward)
      TestUtils.Simulate.click(forward)
      count = TestUtils.findRenderedDOMComponentWithClass(counterWrapper, 'count')
      expect(count.textContent).toBe('3')
    })
  })

  describe('composable', ()=>{
    const counterWrapper2 = connect(intent$=>{
      return {
        sink$: intent$.map(intent=>{
          switch(intent.type) {
            case 'inc2':
              return state=>({count:state.count+2})
            case 'dec2':
              return state=>({count:state.count-2})
            default:
              return state=>state
          }
        }),
        inc2: ()=>({type:'inc2'}),
        dec2: ()=>({type:'dec2'}),
      }
    })
    let counterWrapper21 = compose(counterWrapper2)(counterWrapper)
    const Counter2 = counterWrapper21(CounterView)
    it('counter add inc2, dec2', ()=>{
      let counterWrapper = TestUtils.renderIntoDocument(
        <Most engine={Engine}>
          <Counter2 history={true} />
        </Most>
      )
      let counterView = TestUtils.findRenderedComponentWithType(counterWrapper, CounterView)
      let counter = TestUtils.findRenderedComponentWithType(counterWrapper, Counter2)
      counterView.props.actions.inc()
      counterView.props.actions.inc2()
      counterView.props.actions.dec()
      expect(stateHistoryOf(counter)[2].count).toBe(2)
    })
  })

  describe('convension default to `action` field in sinks', ()=>{
    const Counter = connect(intent$=>{
      return {
        sink$: intent$.map(intent=>{
          switch(intent.type) {
            case 'inc3':
              return state=>({count:state.count+3})
            default:
              return state=>state
          }
        }),
        actions: {
          inc3: ()=>({type: 'inc3'})
        },
      }
    })(CounterView)

    it('counter inc 3', ()=>{
      let counterWrapper = TestUtils.renderIntoDocument(
        <Most engine={Engine}>
          <Counter history={true} />
        </Most>
      )
      let counter = TestUtils.findRenderedComponentWithType(counterWrapper, Counter)
        counter.actions.inc3()
        counter.actions.inc3()
      expect(stateHistoryOf(counter)[1].count).toBe(6)
    })
  })

  describe('ERROR', ()=>{
    const Counter = connect(intent$=>{
      return {
        sink$: intent$.map(intent=>{
          switch(intent.type) {
            case 'exception':
              throw 'exception in reducer'
            case 'inc':
              return state=>({count:state.count+1})
            default:
              return state=>state
          }
        }),
        actions: {
          throwExeption: ()=>({type: 'exception'}),
        },
      }
    })(CounterView)

    it('should recover to identity stream and log exception', ()=>{
      spyOn(console, 'error')
      let counterWrapper = TestUtils.renderIntoDocument(
        <Most>
          <Counter history={true} />
        </Most>
      )
      let counter = TestUtils.findRenderedComponentWithType(counterWrapper, Counter)
      return run(intentStreamOf(counter),
                 dispatch([{type: 'exception'}], counter),
                 [
                   state=>expect(console.error).toBeCalledWith('There is Error in your reducer:', 'exception in reducer', undefined)
                 ])
    })

    it('should able to catch error in sync mode', ()=>{
      let counterWrapper = TestUtils.renderIntoDocument(
        <Most engine={Engine}>
          <Counter history={true} />
        </Most>
      )
      let counter = TestUtils.findRenderedComponentWithType(counterWrapper, Counter)
      expect(()=>{
        counter.actions.throwExeption()
      }).toThrow('exception in reducer')
    })
  })

  describe('unsubscribe when component unmounted', ()=>{
    it('unsubscribe', (done)=>{
      const Counter = connect(intent$=>{
        let incForever$ = most.periodic(100, {type:'inc'}).map(intent=>{
          done.fail('should not send intent any more')
          return _=>_
        })
        return {
          incForever$,
          sink$: intent$.map(intent=>{
            switch(intent.type) {
              case 'inc':
                return state=>({count:state.count+1})
              default:
                return state=>state
            }
          })
        }
      })(CounterView)

      const TogglableMount = React.createClass({
        getInitialState(){
          return {
            mount: true
          }
        },
        render(){
          return this.state.mount && <Counter history={true} />
        }
      })
      spyOn(console, 'error')
      let counterWrapper = TestUtils.renderIntoDocument(
        <Most engine={Engine}>
          <TogglableMount />
        </Most>
      )
      let toggle = TestUtils.findRenderedComponentWithType(counterWrapper, TogglableMount)
      let counter = TestUtils.findRenderedComponentWithType(counterWrapper, Counter)
      toggle.setState({mount:false})
      done()
    })
  })
})
