import React from 'react'
import initHistory from './history'
import mostEngine from './engine/most'
import mergeAll from 'ramda/src/mergeAll'
import pick from 'ramda/src/pick'
import keys from 'ramda/src/keys'
// unfortunately React doesn't support symbol as context key yet, so let me just preteding using Symbol until react implement the Symbol version of Object.assign
const intentStream = "__reactive.react.intentStream__";
const historyStream = "__reactive.react.historyStream__";
const flatObserve = "__reactive.react.flatObserve__";

const CONTEXT_TYPE = {
  [intentStream]: React.PropTypes.object,
  [historyStream]: React.PropTypes.object,
  [flatObserve]: React.PropTypes.func,
}

function observable(obj){
  return !!obj.subscribe
}

export function connect(main, initprops={}) {
  return function(ReactClass){
    class Connect extends React.PureComponent {
      constructor(props, context) {
        super(props, context);
        let _actions = {
          fromEvent(e, f=x=>x){
            context[intentStream].send(f(e));
          },
          fromPromise(p){
            p.then(context[intentStream].send);
          }
        };
        let sinks = main(context[intentStream],props);
        let _actionsSinks = []
        if(initprops.history || props.history){
          initprops.history = initHistory(context[historyStream])
          initprops.history.travel.observe(state=>{
            return this.setState(state)
          })
        }
        for(let name in sinks){
          if(observable(sinks[name])){
            _actionsSinks.push(sinks[name]);
          }
          else if(sinks[name] instanceof Function){
            _actions[name] = (...args)=>{
              return this.context[intentStream].send(sinks[name].apply(this, args));
            }
          }
        }
        this.actionsSinks = _actionsSinks;
        let defaultKey = keys(ReactClass.defaultProps)
        this.state = mergeAll([ReactClass.defaultProps, pick(defaultKey, props)])
        this.actions = mergeAll([_actions, props.actions])
      }
      componentWillReceiveProps(nextProps){
        this.setState(state=>pick(keys(state), nextProps))
      }
      componentDidMount(){
        this.context[flatObserve](this.actionsSinks, (action)=>{
          if(action instanceof Function) {
            this.setState((prevState, props)=>{
              let newState = action.call(this, prevState,props);
              if(initprops.history && newState != prevState){
                initprops.history.cursor = -1;
                this.context[historyStream].send(prevState);
              }
              return newState;
            });
          } else {
            /* istanbul ignore next */
            console.warn('action', action,'need to be a Function which map from current state to new state');
          }
        });
      }
      render() {
        return <ReactClass {...this.props} {...this.state} {...initprops} actions={this.actions} />
      }
    }
    Connect.contextTypes = CONTEXT_TYPE;
    return Connect;
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
      [intentStream]: engine.intentStream,
      [flatObserve]: engine.flatObserve,
      [historyStream]: engine.historyStream,
    }
  },
  render(){
    return React.Children.only(this.props.children);
  }
});

export default Most;
