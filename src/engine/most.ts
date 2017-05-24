import { Stream } from 'most'
import { async, AsyncSubject, Subject } from 'most-subject'
import {Subscription} from './index'
export const URI = 'sStream'
export type URI = typeof URI

declare module './index' {
  interface HKT<A> {
    Stream: Stream<A>
  }
}

export function map<A, B>(f: (a: A) => B, fa: Stream<A>): Stream<B> {
  return fa.map(f)
}
export function subject<A>() {
  return async()
}

export function subscribe<A>(fa: Stream<A>, next: (v: A) => void, complete: () => void) {
  return fa.subscribe({next, error:x => console.error(x), complete}) as Subscription
}

export function merge<A>(a: Stream<A>, b: Stream<A>): Stream<A> {
  return a.merge(b)
}
