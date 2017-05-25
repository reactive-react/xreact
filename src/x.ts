import * as React from 'react';
import { genNodeClass, genLeafClass, CONTEXT_TYPE } from './xclass'
import { StaticStream, HKTS, HKT, Subject } from './engine'
import { Plan, Connect, ConnectClass, Engine, MostProps, ContextEngine, XREACT_ENGINE } from './interfaces'
export { XREACT_ENGINE }
function isConnectClass<E extends HKTS, I, S>(ComponentClass: ConnectClass<E, I, S> | React.ComponentClass<any> | React.SFC<any>): ComponentClass is ConnectClass<E, I, S> {
  return (<ConnectClass<E, I, S>>ComponentClass).contextTypes == CONTEXT_TYPE;
}
export type ConnectOrReactComponent<E extends HKTS, I, S> = ConnectClass<E, I, S> | React.ComponentClass<any> | React.SFC<any>

export function x<E extends HKTS, I, S>(main: Plan<E, I, S>, opts = { history: false }): (WrappedComponent: ConnectOrReactComponent<E, I, S>) => ConnectClass<E, I, S> {
  return function(WrappedComponent: ConnectOrReactComponent<E, I, S>) {
    if (isConnectClass(WrappedComponent)) {
      return genNodeClass(WrappedComponent, main)
    } else {
      return genLeafClass(WrappedComponent, main, opts)
    }
  };
}


export default class X<E extends HKTS, S> extends React.PureComponent<MostProps<E>, S> {
  static childContextTypes = CONTEXT_TYPE
  getChildContext<I, H>(): ContextEngine<E, I, H> {
    let engineClass = this.props.engine
    return {
      [XREACT_ENGINE]: {
        intent$: engineClass.subject() as Subject<E, I>,
        history$: engineClass.subject() as Subject<E, H>,
        travel$: engineClass.subject() as Subject<E, (n: number) => number>,
        operators: engineClass
      }
    }
  }
  render() {
    return React.Children.only(this.props.children);
  }
}
