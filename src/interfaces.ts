import * as React from 'react'
import { Traveler } from './history'
import { StaticStream, HKTS, HKT, Subject, Subscription } from './engine'
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

export interface ConnectProps<I> {
  actions?: Actions<I>
  history?: boolean
  [propName: string]: any;
}

export class Connect<E extends HKTS, I, S> extends React.PureComponent<ConnectProps<I>, S> {
  machine: Machine<E, I, S>
  traveler: Traveler<S>
  subscription: Subscription
  context: ContextEngine<E, I, S>
}

export interface ConnectClass<E extends HKTS, I, S> {
  contextTypes?: ContextEngine<E, I, S>
  defaultProps?: any
  new (props?: ConnectProps<I>, context?: ContextEngine<E, I, S>): Connect<E, I, S>;
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
  history$: Subject<E, S>
  travel$: Subject<E, (n: number) => number>
  operators: StaticStream<E>
}

export interface MostProps<A extends HKTS> {
  engine?: StaticStream<A>
}
export interface ContextEngine<E extends HKTS, I, H> {
  [name: string]: Engine<E, I, H>
}
