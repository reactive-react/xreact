import { Stream, empty, combineArray } from 'most'
import { sync, SyncSubject, Subject } from 'most-subject'
import { Subscription, StreamOps } from './index'

declare module './index' {
  interface HKT<A> {
    Stream: Stream<A>
  }
}

StreamOps.prototype.empty = empty
StreamOps.prototype.merge = function(a, b) {
  return a.merge(b)
}
StreamOps.prototype.filter = function <A>(f: (a: A) => boolean, fa: Stream<A>): Stream<A> {
  return fa.filter(f)
}
StreamOps.prototype.combine = function(f, ...v) {
  return combineArray(f, v)
}
StreamOps.prototype.map = function <A, B>(f: (a: A) => B, fa: Stream<A>): Stream<B> {
  return fa.map(f)
}
StreamOps.prototype.subject = function <A>() {
  return sync()
}

StreamOps.prototype.subscribe = function <A>(fa: Stream<A>, next: (v: A) => void, complete: () => void) {
  return fa.recoverWith(x => {
    console.error(x)
    return fa
  }).subscribe({ next, error: x => console.error(x), complete }) as Subscription
}

export const URI = 'Stream'
export type URI = typeof URI
