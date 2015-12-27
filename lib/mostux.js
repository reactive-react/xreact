import {EventEmitter} from 'events';
import most from 'most';
import React from 'react';
import uuid from 'uuid';

function genUuid(reactClass){
  reactClass.uuid = reactClass.uuid || uuid.v4();
  return reactClass.uuid;
}
const id = _=>_;
const unmount = 'mostux.unmount'
const unmountSymbol = Symbol(unmount);

let addToStateStream = id;
let stateStream = most.create(add => addToStateStream = add);
let count = 0;
stateStream
  .scan((acc={}, state)=>{
    acc[state.name] = state.value
    return acc
  })
  .timestamp()
  .observe(state=>{
    count++;
    console.debug(`${new Date(state.time).toLocaleTimeString()}: state ${count} is ${JSON.stringify(state.value)}`)
  })

export const TxMixin = {
  contextTypes: {
    mostuxChannel: React.PropTypes.object,
  },
  bindActions(actions, imm=id, unimm=id) {
    let addToActionStream = id;
    let actionStream = most.create(add => addToActionStream = add);
    let unmountEvent = new EventEmitter;
    this[unmountSymbol] = unmountEvent.emit.bind(null, unmount);
    let unmountStream = most.fromEvent(unmount, unmountEvent)
    for (let name in actions){
      this.context.mostuxChannel.on(genUuid(this.constructor)+name,
                                      e=>unimm(addToActionStream((prevState,props)=>actions[name].call(this,e,imm(prevState),imm(props), actionStream, stateStream))))
    }
    actionStream
      .until(unmountStream)
      .forEach(action=>this.setState(action,
                                    _=>addToStateStream({
                                      name: this.constructor.displayName||this.constructor.uuid,
                                      value: this.state
                                    })))
      .catch(e=>console.error(e));
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
