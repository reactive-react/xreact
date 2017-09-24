import * as React from 'react'
import { XStream, Stream, M_, Subject, Subscription } from './xs'

export const XREACT_ENGINE = '@reactive-react/xreact.engine';

export interface Actions<T> {
  [propName: string]: (...v: any[]) => T
}

export interface Plan<E extends Stream, I, S> {
  (intent: Subject<E, I>, props?: {}): Machine<E, I, S>

}

export interface Update<S> {
  (current?: S): Partial<S>
}

export interface Machine<E extends Stream, I, S> {
  actions?: Actions<I>,
  update$: M_<Update<S>>[E]
}

export interface Xprops<I> {
  actions?: Actions<I>
  history?: boolean
  [propName: string]: any;
}

export class Xcomponent<E extends Stream, I, S> extends React.PureComponent<Xprops<I>, S> {
  machine: Machine<E, I, S>
  subscription: Subscription
  context: ContextEngine<E, I, S>
}

export interface XcomponentClass<E extends Stream, I, S> {
  contextTypes?: ContextEngine<E, I, S>
  defaultProps?: any
  new (props?: Xprops<I>, context?: ContextEngine<E, I, S>): Xcomponent<E, I, S>;
}

export interface History<E extends Stream, S> {
  path: Subject<E, (n: number) => number>
  history: M_<S>[E]
}

export interface Stamp<S> {
  value: S
  time: number
}

export interface Engine<E extends Stream, I, S> {
  intent$: Subject<E, I>
  history$: Subject<E, S>
}

export interface ContextEngine<E extends Stream, I, H> {
  [name: string]: Engine<E, I, H>
}
