import React, { Component, PropTypes } from 'react';
import {render} from 'react-dom';
import most from 'most';
import Most from '../../../lib/react-most'
import {connect} from '../../../lib/react-most'
const App = React.createClass({

  getInitialState(){
    return {show: false}
  },
  componentDidMount() {
    this.props.actions.add();
    this.props.actions.add();
    this.props.actions.add();
    setTimeout(() => this.setState({
      show: true
    }, () => {
      this.props.actions.add();
      this.props.actions.add();
      this.props.actions.add();
    }), 2000);
  },
  render(){
    return (
      <div>
        <RCount />
        {this.state.show ? <RCount/> : null}
        <button onClick={this.props.actions.add}>+</button>
      </div>
    )
  }
})

const Count = (props) => {
  return <div>{props.count}</div>
}
const RCount = connect((intent$)=>{
  return {
    countSink$: intent$
    .filter(x => x.type === 'add')
    .map(intent => state => ({count: (state.count||0) + 1})),
  }
})(Count)

const RApp = connect((intent$) => {
  return {
    add: _=>({type: 'add'}),
  }
})(App)

render(
  <Most>
    <RApp/>
  </Most>
  , document.getElementById('app'));
