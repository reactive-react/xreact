import * as React from 'react';
import { createElement as h } from 'react'
import * as PropTypes from 'prop-types';
import { Plan, Xcomponent, XcomponentClass, ContextEngine, XREACT_ENGINE, Update, Actions, Xprops } from './interfaces'
import { streamOps, Stream, Subject } from './xs'

export const CONTEXT_TYPE = {
  [XREACT_ENGINE]: PropTypes.shape({
    intent$: PropTypes.object,
    history$: PropTypes.object
  })
};
function isSFC(Component: React.ComponentClass<any> | React.SFC<any>): Component is React.SFC<any> {
  return (typeof Component == 'function')
}

export function extendXComponentClass<E extends Stream, I, S>(WrappedComponent: XcomponentClass<E, I, S>, main: Plan<E, I, S>): XcomponentClass<E, I, S> {
  return class XNode extends WrappedComponent {
    static contextTypes = CONTEXT_TYPE
    static displayName = `X(${getDisplayName(WrappedComponent)})`
    constructor(props: Xprops<I>, context: ContextEngine<E, I, S>) {
      super(props, context);
      let engine = context[XREACT_ENGINE]
      let { actions, update$ } = main(engine.intent$, props)
      this.machine.update$ = streamOps.merge<Update<S>, Update<S>>(this.machine.update$, update$)
      if (actions)
        this.machine.actions = Object.assign({}, bindActions(actions, engine.intent$, this), this.machine.actions)
    }
  }
}
export function genXComponentClass<E extends Stream, I, S>(WrappedComponent: React.ComponentType<S>, main: Plan<E, I, S>, opts?: any): XcomponentClass<E, I, S> {
  return class XLeaf extends Xcomponent<E, I, S> {
    static contextTypes = CONTEXT_TYPE
    static displayName = `X(${getDisplayName(WrappedComponent)})`
    defaultKeys: (keyof S)[]
    constructor(props: Xprops<I>, context: ContextEngine<E, I, S>) {
      super(props, context);
      let engine = context[XREACT_ENGINE]
      let { actions, update$ } = main(engine.intent$, props)
      this.machine = {
        update$: update$
      }
      this.machine.actions = bindActions(actions || {}, engine.intent$, this)

      this.defaultKeys = WrappedComponent.defaultProps ? (<(keyof S)[]>Object.keys(WrappedComponent.defaultProps)) : [];
      this.state = (Object.assign(
        {},
        WrappedComponent.defaultProps,
        <Pick<S, keyof S>>pick(this.defaultKeys, props)
      ));
    }
    componentWillReceiveProps(nextProps: I) {
      this.setState((state, props) => Object.assign({}, nextProps, pick(this.defaultKeys, state)));
    }
    componentDidMount() {
      this.subscription = streamOps.subscribe(
        this.machine.update$,
        (action: Update<S>) => {
          if (action instanceof Function) {
            if (process.env.NODE_ENV == 'debug')
              console.log('UPDATE:', action)
            this.setState((prevState, props) => {
              let newState: S = action.call(this, prevState, props);
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

function getDisplayName<E extends Stream, I, S>(WrappedComponent: React.ComponentType<S>) {
  return WrappedComponent.displayName || WrappedComponent.name || 'X';
}


function bindActions<E extends Stream, I, S>(actions: Actions<void>, intent$: Subject<E, I>, self: XcomponentClass<E, I, S> | Xcomponent<E, I, S>) {
  let _actions: Actions<void> = {
    fromEvent(e: Event) {
      return intent$.next(e);
    },
    fromPromise(p: Promise<I>) {
      return p.then(x => intent$.next(x));
    },
    terminate(a: I) {
      if (process.env.NODE_ENV == 'debug')
        console.error('INTENT TERMINATED')
      return intent$.complete(a)
    }
  };

  for (let a in actions) {
    _actions[a] = (...args: any[]) => {
      return intent$.next(actions[a].apply(self, args));
    };
  }
  return _actions;
}
function pick<A>(names: Array<keyof A>, obj: A) {
  let result = <Pick<A, keyof A>>{};
  for (let name of names) {
    if (obj[name]) result[name] = obj[name];
  }
  return result;
}

function isPromise(p: any): p is Promise<any> {
  return p !== null && typeof p === 'object' && typeof p.then === 'function'
}
