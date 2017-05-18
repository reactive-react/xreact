import * as React from 'react';
import { genNodeClass, genLeafClass, CONTEXT_TYPE, REACT_MOST_ENGINE } from './classGenerator'
import Engine from './engine/most';
import { from } from 'most'
import { Plan, Connect, ConnectClass } from './interfaces'

export { REACT_MOST_ENGINE }
function isConnectClass<I, S>(ComponentClass: ConnectClass<I, S> | React.ComponentClass<any> | React.SFC<any>): ComponentClass is ConnectClass<I, S> {
  return (<ConnectClass<I, S>>ComponentClass).contextTypes == CONTEXT_TYPE;
}
export type ConnectOrReactComponent<I, S> = ConnectClass<I, S> | React.ComponentClass<any> | React.SFC<any>


export function connect<I, S>(main: Plan<I, S>, opts = { history: false }): (WrappedComponent: ConnectOrReactComponent<I, S>) => ConnectClass<I, S> {
  return function(WrappedComponent: ConnectOrReactComponent<I, S>) {
    if (isConnectClass(WrappedComponent)) {
      return genNodeClass(WrappedComponent, main)
    } else {
      return genLeafClass(WrappedComponent, main, opts)
    }
  };
}

export interface MostProps<T, S> {
  engine?: new () => Engine<T, S>
}
export interface MostEngine<I, H> {
  [x: string]: Engine<I, H>
}
export default class Most<I, H, S> extends React.PureComponent<MostProps<I, H>, S> {
  static childContextTypes = CONTEXT_TYPE
  getChildContext(): MostEngine<I, H> {
    let engine: Engine<I, H> = (this.props && this.props.engine && new this.props.engine()) || new Engine<I, H>();
    /* istanbul ignore if */
    if (process.env.NODE_ENV === 'debug') {
      inspect(engine);
    }
    return {
      [REACT_MOST_ENGINE]: engine
    };
  }
  render() {
    return React.Children.only(this.props.children);
  }
}

/* istanbul ignore next */
function inspect(engine) {
  from(engine.intentStream)
    .timestamp()
    .observe(stamp =>
      console.log(`[${new Date(stamp.time).toJSON()}][INTENT]:}`, stamp.value)
    );
  from(engine.historyStream)
    .timestamp()
    .observe(stamp =>
      console.log(`[${new Date(stamp.time).toJSON()}][STATE]:}`, stamp.value)
    );
}
