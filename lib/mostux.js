import {EventEmitter} from 'events';
import React from 'react';
import most from 'most';
import when from 'when';
const id = _=>_;

export function connect(ReactClass, main) {
  class Connect extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.actions = {};
      let sinks = main(context.stateStream, context.intentStream);
      sinks.state$.observe(state=>{
        context.addToStateStream(state);
        this.setState(state);
      });
      for(let name in sinks){
        this.actions[name] = (...args)=>this.context.addToIntentStream(sinks[name].apply(null, args));
      }
    }
    render() {
      return <ReactClass {...this.props} {...this.state} actions={this.actions} />
    }
  }
  Connect.contextTypes = {
    stateStream: React.PropTypes.object,
    intentStream: React.PropTypes.object,
    addToIntentStream: React.PropTypes.func,
    addToStateStream: React.PropTypes.func,
  }
  return Connect;
}

const Mostux = React.createClass({
  childContextTypes: {
    intentStream: React.PropTypes.object,
    stateStream: React.PropTypes.object,
    addToIntentStream: React.PropTypes.func,
    addToStateStream: React.PropTypes.func,
  },
  getChildContext(){
    let addToIntentStream = function(){
      console.error('intent stream not binded');
    };
    let addToStateStream = function(){
      console.error('state stream not binded');
    };
    let actionStream = most.create(add => {
      addToIntentStream = add;
      return function dispose(e){
        addToIntentStream = id
        console.log('disposed');
      }
    });
    let stateStream = most.create(add => {
      addToStateStream = add;
      return function dispose(e){
        addToIntentStream = id
        console.log('disposed');
      }
    });
    actionStream.drain();
    stateStream.drain();
    return {
      stateStream: stateStream,
      intentStream: actionStream,
      addToIntentStream: addToIntentStream,
      addToStateStream: addToStateStream,
    }
  },
  render(){
    return <div>{this.props.children}</div>
  }
});

export default Mostux;
