import * as React from 'react'
import { Stream, Subject, Subscription } from './xs'
import { $ } from './fantasy/typeclasses'
import * as PropTypes from 'prop-types';

export const XREACT_ENGINE = '@reactive-react/xreact.engine';

export interface Actions<T> {
  [propName: string]: (...v: any[]) => T
}

export interface Plan<E extends Stream, I, S> {
  (intent: Subject<E, I>, props?: {}): Machine<E, I, S>
}

export interface Update<S> {
  (current: S): Partial<S>
}

export interface Machine<E extends Stream, I, S> {
  actions?: Actions<I>,
  update$: $<E, Update<S>>
}

export interface ConfiguredMachine<E extends Stream, S> {
  actions?: Actions<void>,
  update$: $<E, Update<S>>
}

export interface Xprops<I> {
  actions?: Actions<I>
  history?: boolean
  [propName: string]: any;
}

export class Xcomponent<E extends Stream, I, S> extends React.PureComponent<Xprops<I>, S> {
  machine: ConfiguredMachine<E, S>
  subscription: Subscription
  context: ContextEngine<E, I, S>
}

export interface XcomponentClass<E extends Stream, I, S> {
  displayName: string
  contextTypes?: ContextType<E, I, S>
  defaultProps?: any
  new(props?: Xprops<I>, context?: ContextEngine<E, I, S>): Xcomponent<E, I, S>;
}

export interface History<E extends Stream, S> {
  path: Subject<E, (n: number) => number>
  history: $<E, S>
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

export interface ContextType<E extends Stream, I, H> {
  [name: string]: PropTypes.Requireable<Engine<E, I, H>>
}
