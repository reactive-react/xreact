import React from 'react'
import initHistory from './history'
import mostEngine from './engine/most'
import mergeAll from 'ramda/src/mergeAll'
import pick from 'ramda/src/pick'
import keys from 'ramda/src/keys'
// unfortunately React doesn't support symbol as context key yet, so let me just preteding using Symbol until react implement the Symbol version of Object.assign
const INTENT_STREAM = "__reactive.react.intentStream__";
const HISTORY_STREAM = "__reactive.react.historyStream__";
const EACH_FLATMAP = "__reactive.react.flatObserve__";

const CONTEXT_TYPE = {
  [INTENT_STREAM]: React.PropTypes.object,
  [HISTORY_STREAM]: React.PropTypes.object,
  [EACH_FLATMAP]: React.PropTypes.func,
}

export function connect(main, initprops={}) {
  return function(WrappedComponent){
    let connectDisplayName = `Connect(${getDisplayName(WrappedComponent)})`
    if (WrappedComponent.contextTypes === CONTEXT_TYPE) {
      class Connect extends React.PureComponent {
        constructor(props, context) {
          super(props, context);
          let [actions, sink$] = actionsAndSinks(main(context[INTENT_STREAM],props), this)
          this.sink$ = sink$.concat(props.sink$||[])
          this.actions = mergeAll([actions, props.actions])
        }
        render(){
          return <WrappedComponent {...this.props} {...initprops} sink$={this.sink$} actions={this.actions}/>
        }
      }
      Connect.contextTypes = CONTEXT_TYPE;
      Connect.displayName = connectDisplayName;
      return Connect;
    }else{
      class Connect extends React.PureComponent {
        constructor(props, context) {
          super(props, context);
          if(initprops.history || props.history){
            initprops.history = initHistory(context[HISTORY_STREAM])
            initprops.history.travel.observe(state=>{
              return this.setState(state)
            })
          }

          let [actions, sink$] = actionsAndSinks(main(context[INTENT_STREAM],props), this)
          this.sink$ = sink$.concat(props.sink$||[])
          this.actions = mergeAll([actions, props.actions])
          let defaultKey = keys(WrappedComponent.defaultProps)
          this.state = mergeAll([WrappedComponent.defaultProps, pick(defaultKey, props)])
        }
        componentWillReceiveProps(nextProps){
          this.setState(state=>pick(keys(state), nextProps))
        }
        componentDidMount(){
          this.subscriptions = this.context[EACH_FLATMAP](this.sink$, (action)=>{
            if(this.subscriptions && this.subscriptions.disposable.disposed)
              return
            else if(action instanceof Function) {
              this.setState((prevState, props)=>{
                let newState = action.call(this, prevState,props);
                if(initprops.history && newState != prevState){
                  initprops.history.cursor = -1;
                  this.context[HISTORY_STREAM].send(prevState);
                }
                return newState;
              });
            } else {
              /* istanbul ignore next */
              console.warn('action', action,'need to be a Function which map from current state to new state');
            }
          });
        }
        componentWillUnmount(){
          this.subscriptions.unsubscribe()
        }
        render() {
          return <WrappedComponent {...this.props} {...this.state} {...initprops} actions={this.actions} />
        }
      }
      Connect.contextTypes = CONTEXT_TYPE;
      Connect.displayName = connectDisplayName;
      return Connect;
    }
  }
}

let Most = React.createClass({
  childContextTypes: CONTEXT_TYPE,
  getChildContext(){
    let engineClass = this.props && this.props.engine || mostEngine
    let engine = engineClass();
    // TODO: add support for ReactiveX
    /* istanbul ignore next */
    if(process.env.NODE_ENV==='debug') {
      if(engineClass == mostEngine) {
        engine.intentStream.timestamp()
          .observe(stamp=>console.log(`[${new Date(stamp.time).toJSON()}][INTENT]:}`, stamp.value));
        engine.historyStream.timestamp()
          .observe(stamp=>console.log(`[${new Date(stamp.time).toJSON()}][STATE]:}`, stamp.value));
      }
    }

    return {
      [INTENT_STREAM]: engine.intentStream,
      [EACH_FLATMAP]: engine.flatObserve,
      [HISTORY_STREAM]: engine.historyStream,
    }
  },
  render(){
    return React.Children.only(this.props.children);
  }
});

export default Most;

function observable(obj){
  return !!obj.subscribe
}

function actionsAndSinks(sinks, self){
  let _sinks = [];
  let _actions = {
    fromEvent(e, f=x=>x){
      self.context[INTENT_STREAM].send(f(e));
    },
    fromPromise(p){
      p.then(self.context[INTENT_STREAM].send);
    }
  };
  for(let name in sinks){
    let value = sinks[name]
    if(observable(value)){
      _sinks.push(value);
    } else if(value instanceof Function){
      _actions[name] = (...args)=>{
        return self.context[INTENT_STREAM].send(value.apply(self, args));
      }
    } else if(name === 'actions') {
      for(let a in value)
        _actions[a] = (...args)=>{
          return self.context[INTENT_STREAM].send(value[a].apply(self, args));
      }
    }
  }
  return [_actions, _sinks]
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
