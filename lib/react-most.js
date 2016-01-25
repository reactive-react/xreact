import React from 'react'
import most from 'most'
// unfortunately React doesn't support symbol as context key yet, so let me just preteding using Symbol until react implement the Symbol version of Object.assign
const intentStream = "__reactive.react.intentStream__";
const addToIntentStream = "__reactive.react.addToIntentStream__";
const flatObserve = "__reactive.react.flatObserve__";

function observable(obj){
  return !!obj.observe
}

const id = _=>_;
function mostify() {
  let addToIntentStream = function(){
    console.error('intent stream not binded');
  };
  let intentStream = most.create(add => {
    addToIntentStream = add;
    return function dispose(e){
      addToIntentStream = id;
      console.log('action stream disposed');
    }
  });
  intentStream.drain();

  function flatObserve(actionsSinks, f){
    return most.from(actionsSinks).join().observe(f);
  }
  return {intentStream, addToIntentStream, flatObserve}
}

export function connect(ReactClass, main, props) {
  class Connect extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.actions = {};
      let sinks = main(context[intentStream]);
      context[intentStream].timestamp()
        .observe(stamp=>console.log(`[${new Date(stamp.time).toLocaleTimeString()}][INTENT]: ${JSON.stringify(stamp.value)}`));
      let actionsSinks = []
      for(let name in sinks){
        if(observable(sinks[name]))
          actionsSinks.push(sinks[name]);
        else if(sinks[name] instanceof Function){
          this.actions[name] = (...args)=>this.context[addToIntentStream](sinks[name].apply(null, args));
        }
      }
      this.context[flatObserve](actionsSinks, (action)=>{
        if(action instanceof Function)
          this.setState((prevState, props)=>{
            let newState = action.call(this, prevState,props);
            return newState;
          });
        else
          console.warn('action', action,'need to be a Functioin map from state to new state');
      })
    }
    render() {
      return <ReactClass {...this.props} {...this.state} actions={this.actions} />
    }
  }
  Connect.contextTypes = {
    [intentStream]: React.PropTypes.object,
    [addToIntentStream]: React.PropTypes.func,
    [flatObserve]: React.PropTypes.func,
  }
  return Connect;
}

let Most = React.createClass({
  childContextTypes: {
    [intentStream]: React.PropTypes.object,
    [addToIntentStream]: React.PropTypes.func,
    [flatObserve]: React.PropTypes.func,
  },
  getChildContext(){
    let engineClass = this.props && this.props.engine || mostify
    let engine = engineClass();
    return {
      [intentStream]: engine.intentStream,
      [addToIntentStream]: engine.addToIntentStream,
      [flatObserve]: engine.flatObserve,
    }
  },
  render(){
    return React.Children.only(this.props.children);
  }
});

export default Most;
