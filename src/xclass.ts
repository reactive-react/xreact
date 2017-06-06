import * as React from 'react';
import { createElement as h } from 'react'
import { PropTypes } from 'prop-types';
import { Plan, Xcomponent, XcomponentClass, ContextEngine, XREACT_ENGINE, Update } from './interfaces'
import { StaticStream, HKTS, HKT } from './xs'

export const CONTEXT_TYPE = {
  [XREACT_ENGINE]: PropTypes.shape({
    intent$: PropTypes.object,
    operators: PropTypes.object
  })
};
function isSFC(Component: React.ComponentClass<any> | React.SFC<any>): Component is React.SFC<any> {
  return (typeof Component == 'function')
}

export function extendXComponentClass<E extends HKTS, I, S>(WrappedComponent: XcomponentClass<E, I, S>, main: Plan<E, I, S>): XcomponentClass<E, I, S> {
  return class XNode extends WrappedComponent {
    static contextTypes = CONTEXT_TYPE
    static displayName = `X(${getDisplayName(WrappedComponent)})`
    constructor(props, context: ContextEngine<E, I, S>) {
      super(props, context);
      let engine = context[XREACT_ENGINE]
      let { actions, update$ } = main(engine.intent$, props)
      this.machine = {
        update$: engine.operators.merge<Update<S>>(this.machine.update$, update$),
        actions: Object.assign({}, bindActions(actions, context[XREACT_ENGINE].intent$, this), this.machine.actions)
      }
    }
  }
}
export function genXComponentClass<E extends HKTS, I, S>(WrappedComponent: React.SFC<any> | React.ComponentClass<any>, main: Plan<E, I, S>, opts?): XcomponentClass<E, I, S> {
  return class XLeaf extends Xcomponent<E, I, S> {
    static contextTypes: ContextEngine<E, I, S> = CONTEXT_TYPE
    static displayName = `X(${getDisplayName(WrappedComponent)})`
    defaultKeys: string[]
    constructor(props, context: ContextEngine<E, I, S>) {
      super(props, context);
      let engine = context[XREACT_ENGINE]
      let { actions, update$ } = main(engine.intent$, props)
      this.machine = {
        actions: bindActions(actions, engine.intent$, this),
        update$: update$
      }
      this.defaultKeys = WrappedComponent.defaultProps ? Object.keys(WrappedComponent.defaultProps) : [];
      this.state = Object.assign(
        {},
        WrappedComponent.defaultProps,
        pick(this.defaultKeys, props)
      );
    }
    componentWillReceiveProps(nextProps) {
      this.setState(state => Object.assign({}, nextProps, pick(this.defaultKeys, state)));
    }
    componentDidMount() {
      this.subscription = this.context[XREACT_ENGINE].operators.subscribe(
        this.machine.update$,
        action => {
          if (action instanceof Function) {
            if (process.env.NODE_ENV == 'debug')
              console.log('UPDATE:', action)
            this.setState((prevState, props) => {
              let newState = action.call(this, prevState, props);
              this.context[XREACT_ENGINE].history$.next(newState)
              if (process.env.NODE_ENV == 'debug')
                console.log('STATE:', newState)
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
        () => {
          this.context[XREACT_ENGINE].history$.complete(this.state)
          if (process.env.NODE_ENV == 'production') {
            console.error('YOU HAVE TERMINATED THE INTENT STREAM...')
          }
          if (process.env.NODE_ENV == 'debug') {
            console.log(`LAST STATE is`, this.state)
          }
        }
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
          })
        );
      } else {
        return h(
          WrappedComponent,
          Object.assign({}, opts, this.props, this.state, {
            actions: this.machine.actions,
          })
        );
      }
    }
  }
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'X';
}
function bindActions(actions, intent$, self) {
  let _actions = {
    fromEvent(e, f = x => x) {
      return intent$.next(f(e));
    },
    fromPromise(p) {
      return p.then(x => intent$.next(x));
    },
    terminate(a) {
      if (process.env.NODE_ENV == 'debug')
        console.error('INTENT TERMINATED')
      return intent$.complete(a)
    }
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
