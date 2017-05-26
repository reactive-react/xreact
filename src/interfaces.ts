import * as React from 'react'
import { Traveler } from './history'
import { StaticStream, HKTS, HKT, Subject, Subscription } from './xs'

export const XREACT_ENGINE = '@reactive-react/xreact.engine';

export interface Actions<T> {
  [propName: string]: (...v: any[]) => T
}

export interface Plan<E extends HKTS, I, S> {
  (intent: Subject<E, I>, props?: {}): Machine<E, I, S>

}

export interface Update<S> {
  (current: S): S
}

export interface Machine<E extends HKTS, I, S> {
  actions?: Actions<I>,
  update$: HKT<Update<S>>[E]
}

export interface Xprops<I> {
  actions?: Actions<I>
  history?: boolean
  [propName: string]: any;
}

export class Xcomponent<E extends HKTS, I, S> extends React.PureComponent<Xprops<I>, S> {
  machine: Machine<E, I, S>
  traveler: Traveler<S>
  subscription: Subscription
  context: ContextEngine<E, I, S>
}

export interface XcomponentClass<E extends HKTS, I, S> {
  contextTypes?: ContextEngine<E, I, S>
  defaultProps?: any
  new (props?: Xprops<I>, context?: ContextEngine<E, I, S>): Xcomponent<E, I, S>;
}

export interface History<E extends HKTS, S> {
  path: Subject<E, (n: number) => number>
  history: HKT<S>[E]
}

export interface Stamp<S> {
  value: S
  time: number
}

export interface Engine<E extends HKTS, I, S> {
  intent$: Subject<E, I>
  operators: StaticStream<E>
}

export interface XProps<A extends HKTS> {
  x: StaticStream<A>
}
export interface ContextEngine<E extends HKTS, I, H> {
  [name: string]: Engine<E, I, H>
}
