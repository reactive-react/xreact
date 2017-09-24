import { Actions } from '../interfaces'
import { State } from './state'
import { Subject, Stream, M_ } from '../xs'
export type Partial<T> = {
  [P in keyof T]?: T[P];
}

export interface pair<S, A> {
  s: S
  a: A
}

export type StateP<S> = State<S, Partial<S>>

export interface Machine<E extends Stream, I, S, A> {
  actions?: Actions<I>
  update$: M_<State<S, A>>[E]
}

export type PlanS<E extends Stream, I, S, A> = (i: Subject<E, I>) => Machine<E, I, S, A>
