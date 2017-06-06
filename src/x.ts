import * as React from 'react';
import { extendXComponentClass, genXComponentClass, CONTEXT_TYPE } from './xclass'
import { StaticStream, HKTS, HKT, Subject } from './xs'
import { Plan, Xcomponent, XcomponentClass, Engine, XProps, ContextEngine, XREACT_ENGINE } from './interfaces'
export { XREACT_ENGINE }

function isXcomponentClass<E extends HKTS, I, S>(ComponentClass: XcomponentClass<E, I, S> | React.ComponentClass<any> | React.SFC<any>): ComponentClass is XcomponentClass<E, I, S> {
  return (<XcomponentClass<E, I, S>>ComponentClass).contextTypes == CONTEXT_TYPE;
}
export type XOrReactComponent<E extends HKTS, I, S> = XcomponentClass<E, I, S> | React.ComponentClass<any> | React.SFC<any>

export function x<E extends HKTS, I, S>(main: Plan<E, I, S>, opts = {}): (WrappedComponent: XOrReactComponent<E, I, S>) => XcomponentClass<E, I, S> {
  return function(WrappedComponent: XOrReactComponent<E, I, S>) {
    if (isXcomponentClass(WrappedComponent)) {
      return extendXComponentClass(WrappedComponent, main)
    } else {
      return genXComponentClass(WrappedComponent, main, opts)
    }
  };
}


export default class X<E extends HKTS> extends React.PureComponent<XProps<E>, {}> {
  static childContextTypes = CONTEXT_TYPE
  getChildContext<I, H>(): ContextEngine<E, I, H> {
    let XClass = this.props.x
    return {
      [XREACT_ENGINE]: {
        intent$: XClass.subject() as Subject<E, I>,
        history$: XClass.subject() as Subject<E, H>,
        operators: XClass
      }
    }
  }
  render() {
    return React.Children.only(this.props.children);
  }
}
