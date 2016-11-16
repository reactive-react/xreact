import React from 'react'
import initHistory from './history'
import mostEngine from './engine/most'
import mergeAll from 'ramda/src/mergeAll'
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
    class Connect extends React.Component {
      constructor(props, context) {
        super(props, context);
        // the outer props has higher piority
        this.state = mergeAll([ReactClass.defaultProps, initprops, props])
        initprops = {}
        if(props.history) initprops.history=true
        this.actions = {
          fromEvent(e){
            let {type, target} = e;
            context[intentStream].send({type,target});
          },
          fromPromise(p){
            p.then(context[intentStream].send);
          }
        };
        let sinks = main(context[intentStream],props);
        let actionsSinks = []
        if(initprops.history){
          initprops.history = initHistory(context[historyStream])
          initprops.history.travel.observe(state=>{
            return this.setState(state)
          })
        }
        for(let name in sinks){
          if(observable(sinks[name])){
            actionsSinks.push(sinks[name]);
          }
          else if(sinks[name] instanceof Function){
            this.actions[name] = (...args)=>{
              return this.context[intentStream].send(sinks[name].apply(null, args));
            }
          }
        }
        this.actionsSinks = actionsSinks;
      }
      componentDidMount(){
        this.context[flatObserve](this.actionsSinks, (action)=>{
          if(action instanceof Function)
            this.setState((prevState, props)=>{
              let newState = action.call(this, prevState,props);
              if(initprops.history && newState != prevState){
                initprops.history.cursor = -1;
                this.context[historyStream].send(prevState);
              }
              return newState;
            });
          else
            console.warn('action', action,'need to be a Function which map from current state to new state');
        });
      }
      render() {
        return <ReactClass {...this.state} {...initprops} actions={this.actions} />
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
