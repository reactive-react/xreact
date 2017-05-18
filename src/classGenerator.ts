import * as React from 'react';
import { PropTypes } from 'prop-types';
import initHistory, { Traveler } from './history';
import { Plan, Connect, ConnectClass } from './interfaces'
import Engine from './engine/most';

// unfortunately React doesn't support symbol as context key yet, so let me just preteding using Symbol until react implement the Symbol version of Object.assign
export const REACT_MOST_ENGINE = '@@reactive-react/react-most.engine';

const h = React.createElement;
export const CONTEXT_TYPE = {
  [REACT_MOST_ENGINE]: PropTypes.object
};
function isSFC(Component: React.ComponentClass<any> | React.SFC<any>): Component is React.SFC<any> {
  return (typeof Component == 'function')
}

export function genNodeClass<I, S>(WrappedComponent: ConnectClass<I, S>, main: Plan<I, S>): ConnectClass<I, S> {
  return class ConnectNode extends WrappedComponent {
    static contextTypes = CONTEXT_TYPE
    static displayName = `Connect(${getDisplayName(WrappedComponent)})`
    constructor(props, context) {
      super(props, context);
      let { actions, update$ } = main(context[REACT_MOST_ENGINE].intentStream, props)
      this.machine = {
        update$: this.machine.update$.merge(update$),
        actions: Object.assign({}, bindActions(actions, context[REACT_MOST_ENGINE].intentStream, this), this.machine.actions)
      }
    }
  }
}
export function genLeafClass<I, S>(WrappedComponent: React.SFC<any> | React.ComponentClass<any>, main: Plan<I, S>, opts?): ConnectClass<I, S> {
  return class ConnectLeaf extends Connect<I, S> {
    static contextTypes = CONTEXT_TYPE
    static displayName = `Connect(${getDisplayName(WrappedComponent)})`
    constructor(props, context) {
      super(props, context);
      let engine: Engine<I, S> = context[REACT_MOST_ENGINE]
      if (opts.history || props.history) {
        this.traveler = initHistory(engine.historyStream, engine.travelStream);
        this.traveler.travel.forEach(state => {
          return this.setState(state);
        });
      }
      let { actions, update$ } = main(engine.intentStream, props)
      this.machine = {
        actions: bindActions(actions, engine.intentStream, this),
        update$: update$
      }
      let defaultKeys = WrappedComponent.defaultProps ? Object.keys(WrappedComponent.defaultProps) : [];
      this.state = Object.assign(
        {},
        WrappedComponent.defaultProps,
        pick(defaultKeys, props)
      );
    }
    componentWillReceiveProps(nextProps) {
      this.setState(state => pick(Object.keys(state), nextProps));
    }
    componentDidMount() {
      this.subscription = this.context[REACT_MOST_ENGINE].observe(
        this.machine.update$,
        action => {
          if (action instanceof Function) {
            this.setState((prevState, props) => {
              let newState = action.call(this, prevState, props);
              if ((opts.history || props.history) && newState != prevState) {
                this.traveler.cursor = -1;
                this.context[REACT_MOST_ENGINE].historyStream.next(prevState);
              }
              return newState;
            });
          } else {
            /* istanbul ignore next */
            console.warn(
              'action',
              action,
              'need to be a Function which map from current state to new state'
            );
          }
        },
        () => this.context[REACT_MOST_ENGINE].historyStream.complete(this.state)
      );
    }
    componentWillUnmount() {
      this.subscription.unsubscribe();
    }
    render() {
      if (isSFC(WrappedComponent)) {
        return h(
          WrappedComponent,
          Object.assign({}, opts, this.props, this.state, {
            actions: this.machine.actions,
            traveler: this.traveler
          })
        );
      } else {
        return h(
          WrappedComponent,
          Object.assign({}, opts, this.props, this.state, {
            actions: this.machine.actions,
            traveler: this.traveler
          })
        );
      }
    }
  }
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
function bindActions(actions, intent$, self) {
  let _actions = {
    fromEvent(e, f = x => x) {
      return intent$.next(f(e));
    },
    fromPromise(p) {
      return p.then(x => intent$.next(x));
    },
  };

  for (let a in actions) {
    _actions[a] = (...args) => {
      return intent$.next(actions[a].apply(self, args));
    };
  }
  return _actions;
}
function pick(names, obj) {
  let result = {};
  for (let name of names) {
    if (obj[name]) result[name] = obj[name];
  }
  return result;
}
