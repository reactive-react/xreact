import {EventEmitter} from 'events';
import most from 'most';
import React from 'react';
import uuid from 'uuid';
import when from 'when';
function genUuid(reactClass){
  reactClass.uuid = reactClass.uuid || uuid.v4();
  return reactClass.uuid;
}
const id = _=>_;
const unmount = 'mostux.unmount'
const unmountSymbol = Symbol(unmount);

export const TxMixin = {
  contextTypes: {
    mostuxChannel: React.PropTypes.object,
  },
  bindActions(actions, imm=id, unimm=id) {
    let addToActionStream = id;
    let actionStream = most.create(add => {
      addToActionStream = add;
      return function dispose(e){
        console.log('disposed');
      }
    });
    let unmountEvent = new EventEmitter;
    this[unmountSymbol] = unmountEvent.emit.bind(null, unmount);
    let unmountStream = most.fromEvent(unmount, unmountEvent)
    for (let name in actions){
      this.context.mostuxChannel.on(genUuid(this.constructor)+name,
                                      e=>unimm(addToActionStream((prevState,props)=>actions[name].call(this,e,imm(prevState),imm(props), actionStream, stateStream))))
    }
    let stateStream = actionStream
          .until(unmountStream)
          .tap(action=>this.setState(action))
          .map(_=>this.state);
    stateStream.timestamp()
      .observe(state=>{
        console.debug(`${new Date(state.time).toLocaleTimeString()}: state is ${JSON.stringify(state.value)}`)
      })
      .catch(e=>console.error('mostux ERROR:' + e));
    return stateStream;
  },
  bindReactiveActions(actions, imm=id, unimm=id){

  },
  unbindActions(){
    this[unmountSymbol]&&this[unmountSymbol]('unbind action');
  },
  componentWillUnmount(){
    this.unbindActions();
  },
  dispatch(where, how, what) {
    this.context.mostuxChannel.emit(genUuid(where)+how,what);
  }
}

export function mixin(reactClass, ...actions) {
  reactClass.contextTypes = TxMixin.contextTypes;
  for (let name in TxMixin) {
    if(name!='contextTypes')
      reactClass.prototype[name] = TxMixin[name];
  }
  let oldMountFunc = reactClass.prototype.componentDidMount;
  let oldUnmountFunc = reactClass.prototype.componentWillUnmount;
  reactClass.prototype.componentDidMount = function(){
    oldMountFunc && oldMountFunc.call(this);
    this.bindActions(...actions);
  }
  reactClass.prototype.componentWillUnmount = function(){
    oldUnmountFunc && oldUnmountFunc.call(this);
    this.unbindActions();
  }
  return reactClass
}

const Mostux = React.createClass({
  childContextTypes: {
    mostuxChannel: React.PropTypes.object,
  },
  getChildContext(){
    return {
      mostuxChannel: new EventEmitter,
    }
  },
  render(){
    return <div>{this.props.children}</div>
  }
});

export default Mostux;
