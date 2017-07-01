import { Actions } from '../interfaces'
import { State } from './state'
import { Subject, HKTS, HKT } from '../xs'
export type Partial<T> = {
  [P in keyof T]?: T[P];
}

export interface pair<S, A> {
  s: S
  a: A
}

export type StateP<S> = State<S, Partial<S>>

export interface Machine<E extends HKTS, I, S> {
  actions?: Actions<I>
  update$: HKT<StateP<S>>[E]
}

export type PlanS<E extends HKTS, I, S> = (i: Subject<E, I>) => Machine<E, I, S>
