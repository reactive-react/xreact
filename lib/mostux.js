import {EventEmitter} from 'events';
import React from 'react';
import most from 'most';
const id = _=>_;
export function connect(ReactClass, main) {
  class Connect extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.actions = {};
      let sinks = main(context.stateStream, context.intentStream);
      context.stateStream.timestamp()
        .observe(stamp=>console.log(`[${new Date(stamp.time).toLocaleTimeString()}]: ${JSON.stringify(stamp.value)}`));
      context.intentStream.timestamp()
        .observe(stamp=>console.log(`[${new Date(stamp.time).toLocaleTimeString()}]: ${JSON.stringify(stamp.value.type)}`));
      for(let name in sinks){
        if(!name.match(/.*\$$/))
          this.actions[name] = (...args)=>this.context.addToIntentStream(sinks[name].apply(null, args));
        else
          sinks[name].observe(state=>{
            context.addToStateStream(state);
            this.setState(state);
          });

      }
    }
    componentWillUnmount(){
      this.context.stateStream.end();
      this.context.intentStream.end();
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
        console.log('action stream disposed');
      }
    });
    let stateStream = most.create(add => {
      addToStateStream = add;
      return function dispose(e){
        addToIntentStream = id
        console.log('state stream disposed');
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
