import * as React from 'react'
import { Traveler } from './history'
export interface Actions<T> {
  [propName: string]: (...v: any[]) => T
}
export interface Subject<T> {
  next: (v?: T) => void
  complete: (v?: any) => void
}

export interface Subscription<A> {
  unsubscribe(): void;
}

export interface Stream<A> {
  merge: (a: Stream<A>) => Stream<A>
}
export interface Plan<I, S> {
  (intent: Subject<I>, props?: {}): Machine<I, S>

}
export interface Update<S> {
  (current: S): S
}
export interface Machine<I, S> {
  actions?: Actions<I>,
  update$: Stream<Update<S>>
}

export interface ConnectProps<I> {
  actions?: Actions<I>
  history?: boolean
  [propName: string]: any;
}

export class Connect<I, S> extends React.PureComponent<ConnectProps<I>, S> {
  machine: Machine<I, S>
  traveler: Traveler<S>
  subscription: Subscription<S>
}

export interface ConnectClass<I, S> {
  contextTypes?: any
  defaultProps?: any
  new (props?: ConnectProps<I>, context?: any): Connect<I, S>;
}

export interface History<S> {
  path: Subject<(n: number) => number>
  history: Stream<S>
}

export interface Stamp<S> {
  value: S
  time: number
}

export interface Engine<I, S> {
  intent$: Subject<I>
  history$: Subject<S>
  travel$: Subject<(n: number) => number>
}

export interface MostProps<T, S> {
  engine?: new () => Engine<T, S>
}
export interface ContextEngine<I, H> {
  [x: string]: Engine<I, H>
}
