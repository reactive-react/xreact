import * as React from 'react';
import * as PropTypes from 'prop-types'

import { extendXComponentClass, genXComponentClass, CONTEXT_TYPE } from './xclass'
import { streamOps, Stream, Subject } from './xs'
import { Plan, Xcomponent, XcomponentClass, Engine, ContextEngine, XREACT_ENGINE } from './interfaces'
export { XREACT_ENGINE }

export function isXcomponentClass<E extends Stream, I, S>(ComponentClass: XcomponentClass<E, I, S> | React.ComponentClass<any> | React.SFC<any>): ComponentClass is XcomponentClass<E, I, S> {
  return (<XcomponentClass<E, I, S>>ComponentClass).contextTypes == CONTEXT_TYPE;
}
export type XOrReactComponent<E extends Stream, I, S> = XcomponentClass<E, I, S> | React.ComponentClass<S> | React.SFC<S>

export function x<E extends Stream, I, S>(main: Plan<E, I, S>, opts = {}): (WrappedComponent: XOrReactComponent<E, I, S>) => XcomponentClass<E, I, S> {
  return function(WrappedComponent: XOrReactComponent<E, I, S>) {
    if (isXcomponentClass(WrappedComponent)) {
      return extendXComponentClass(WrappedComponent, main)
    } else {
      return genXComponentClass(WrappedComponent, main, opts)
    }
  };
}

export class X<E extends Stream> extends React.PureComponent<{}, {}> {
  static childContextTypes = CONTEXT_TYPE
  getChildContext<I, H>(): ContextEngine<E, I, H> {
    return {
      [XREACT_ENGINE]: {
        intent$: streamOps.subject() as Subject<E, I>,
        history$: streamOps.subject() as Subject<E, H>
      }
    }
  }
  render() {
    return React.Children.only(this.props.children);
  }
}
