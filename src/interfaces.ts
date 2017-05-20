import * as React from 'react'
import { Traveler } from './history'
import {Stream as MostStream} from 'most'
import {Subject as MostSubject} from 'most-subject'
import {Observable as RxStream, Subject as RxSubject} from '@reactivex/rxjs'
export interface Actions<T> {
  [actionName: string]: (...p: any[]) => T
}

export interface BindActions<T> {
  [actionName: string]: (...p: any[]) => void
}
export type Subject<T> = MostSubject<T> | RxSubject<T>

export interface Subscription<A> {
  unsubscribe(): void;
}

export type Stream<A> = MostStream<A> | RxStream<A> 
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

export interface RunableMachine<I, S> {
  actions?: BindActions<I>,
  update$: Stream<Update<S>>
}
export interface ConnectProps<I> {
  actions?: Actions<I>
  history?: boolean
  [propName: string]: any;
}

export class Connect<I, S> extends React.PureComponent<ConnectProps<I>, S> {
  machine: RunableMachine<I, S>
  traveler: Traveler<S>
  subscription: Subscription<S>
}

export interface ConnectClass<I, S> {
  contextTypes?: ContextEngine<I,S>
  new (props: ConnectProps<I>, context: ContextEngine<I,S>): Connect<I, S>;
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
  intentStream: Subject<I>
  historyStream: Subject<S>
  travelStream: Subject<(n: number) => number>
  merge(a: Stream<Update<S>>, b: Stream<Update<S>>): Stream<Update<S>>
  observe(actionsSinks: Stream<Update<S>>, f, end): Subscription<S> 
}

export interface MostProps<T, S> {
  engine?: new () => Engine<T, S>
}
export interface ContextEngine<I, H> {
  [x: string]: Engine<I, H>
}
