import React from 'react';
import most from 'most';
const id = _=>_;
// unfortunately React doesn't support symbol as context key yet, so let me just preteding using Symbol until react implement the Symbol version of Object.assign
const stateStream = "Symbol('state stream')";
const intentStream = "Symbol('intent stream')";
const addToStateStream = "Symbol('add state to state stream')";
const addToIntentStream = "Symbol('add intent to intent stream')";

export function connect(ReactClass, main) {
  class Connect extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.actions = {};
      let sinks = main(context[stateStream], context[intentStream]);
      context[stateStream].timestamp()
        .observe(stamp=>console.log(`[${new Date(stamp.time).toLocaleTimeString()}]: ${JSON.stringify(stamp.value)}`));
      context[intentStream].timestamp()
        .observe(stamp=>console.log(`[${new Date(stamp.time).toLocaleTimeString()}]: ${JSON.stringify(stamp.value.type)}`));
      for(let name in sinks){
        if(!name.match(/.*\$$/))
          this.actions[name] = (...args)=>this.context[addToIntentStream](sinks[name].apply(null, args));
        else
          sinks[name].observe(state=>{
            context[addToStateStream](state);
            this.setState(state);
          });

      }
    }
    componentWillUnmount(){
      this.context[stateStream].end();
      this.context[intentStream].end();
    }
    render() {
      return <ReactClass {...this.props} {...this.state} actions={this.actions} />
    }
  }
  Connect.contextTypes = {
    [stateStream]: React.PropTypes.instanceOf(most.Stream),
    [intentStream]: React.PropTypes.instanceOf(most.Stream),
    [addToIntentStream]: React.PropTypes.func,
    [addToStateStream]: React.PropTypes.func,
  }
  return Connect;
}

const Most = React.createClass({
  childContextTypes: {
    [intentStream]: React.PropTypes.instanceOf(most.Stream),
    [stateStream]: React.PropTypes.instanceOf(most.Stream),
    [addToIntentStream]: React.PropTypes.func,
    [addToStateStream]: React.PropTypes.func,
  },
  getChildContext(){
    let _addToIntentStream = function(){
      console.error('intent stream not binded');
    };
    let _addToStateStream = function(){
      console.error('state stream not binded');
    };
    let _actionStream = most.create(add => {
      _addToIntentStream = add;
      return function dispose(e){
        _addToIntentStream = id;
        console.log('action stream disposed');
      }
    });
    let _stateStream = most.create(add => {
      _addToStateStream = add;
      return function dispose(e){
        _addToIntentStream = id;
        console.log('state stream disposed');
      }
    });
    _actionStream.drain();
    _stateStream.drain();
    return {
      [stateStream]: _stateStream,
      [intentStream]: _actionStream,
      [addToIntentStream]: _addToIntentStream,
      [addToStateStream]: _addToStateStream,
    }
  },
  render(){
    return React.Children.only(this.props.children);
  }
});

export default Most;
