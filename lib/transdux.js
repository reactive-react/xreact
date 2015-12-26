import {EventEmitter} from 'events';
import most from 'most';
import React from 'react';
import uuid from 'uuid';

function genUuid(reactClass){
  reactClass.uuid = reactClass.uuid || uuid.v4();
  return reactClass.uuid;
}
const id = _=>_;
let addToStateStream = id;
let stateStream = most.create(add => addToStateStream = add);
let count = 0;
stateStream
  .timestamp()
  .observe(state=>{
    count++;
    console.log('state:', state, count)
})
export const TxMixin = {
  contextTypes: {
    transduxChannel: React.PropTypes.object,
  },
  bindActions(actions, imm=id, unimm=id) {
    let addToActionStream = id;
    let actionStream = most.create(add => addToActionStream = add);

    for(let name in actions){
      this.context.transduxChannel.on(genUuid(this.constructor)+name,
                                      e=>unimm(addToActionStream((prevState,props)=>actions[name].call(this,e,imm(prevState),imm(props)))))
    }
    actionStream.forEach(action=>this.setState(action, _=>addToStateStream(this.state)))
  },
  dispatch(where, how, what) {
    this.context.transduxChannel.emit(genUuid(where)+how,what);
  }
}

export function mixin(reactClass, ...actions) {
  reactClass.contextTypes = TxMixin.contextTypes;
  for (let name in TxMixin) {
    if(name!='contextTypes')
      reactClass.prototype[name] = TxMixin[name];
  }
  let oldMountFunc = reactClass.prototype.componentDidMount;
  reactClass.prototype.componentDidMount = function(){
    oldMountFunc && oldMountFunc();
    this.bindActions(...actions);
  }
  return reactClass
}

const Transdux = React.createClass({
  childContextTypes: {
    transduxChannel: React.PropTypes.object,
  },
  getChildContext(){
    return {
      transduxChannel: new EventEmitter,
    }
  },
  render(){
    return <div>{this.props.children}</div>
  }
});

export default Transdux;
