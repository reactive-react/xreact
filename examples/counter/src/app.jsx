import React from 'react';
import {render} from 'react-dom';
import Most, {connect} from '../../../lib/react-most'

const CounterView = props => (
      <div>
	<button onClick={props.actions.dec}-</button>
	<span>{props.count}</span>
        <button onClick={props.actions.inc}>+</button>
      </div>
    )
  }
})

CounterView.defaultProps = {count: 0};

const reactify = connect((intent$)=>{
    return {
	sink$: intent$.map(intent => {
	    switch(intent.type) {
	    case 'inc':
		return state => ({count: state.count+1});
	    case 'dec':
		return state => ({count: state.count-1});
	    default:
		return _ => _;
	    }
	}),
	inc: () => ({type: 'inc'}),
	dec: () => ({type: 'dec'}),
    }
})

const Counter = reactify(CounterView)

render(
  <Most>
    <Counter />
  </Most>
  , document.getElementById('app'));
