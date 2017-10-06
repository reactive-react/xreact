import { Stream as MostStream, empty, just, combineArray } from 'most'
import { sync, SyncSubject, Subject } from 'most-subject'
import { Subscription, StreamOps } from '.'

declare module '.' {
  interface M_<A> {
    'most': MostStream<A>
  }
}
declare module '../fantasy/typeclasses' {
  interface _<A> {
    'most': MostStream<A>
  }
}

StreamOps.prototype.empty = empty
StreamOps.prototype.just = just

StreamOps.prototype.scan = function(f, base, fa) {
  return fa.scan(f, base)
}
StreamOps.prototype.merge = function(a, b) {
  return a.merge(b)
}

StreamOps.prototype.flatMap = function(f, fa) {
  return fa.flatMap(f)
}

StreamOps.prototype.filter = function <A>(f: (a: A) => boolean, fa: MostStream<A>): MostStream<A> {
  return fa.filter(f)
}

StreamOps.prototype.combine = function <A, C>(
  f: (...a: any[]) => C,
  ...v: MostStream<any>[]
): MostStream<C> {
  return combineArray(f, v)
}

StreamOps.prototype.map = function <A, B>(f: (a: A) => B, fa: MostStream<A>): MostStream<B> {
  return fa.map(f)
}
StreamOps.prototype.subject = function <A>() {
  return sync()
}

StreamOps.prototype.subscribe = function <A>(fa: MostStream<A>, next: (v: A) => void, complete: () => void) {
  return fa.recoverWith(x => {
    console.error(x)
    return fa
  }).subscribe({ next, error: x => console.error(x), complete }) as Subscription
}

export const URI = 'Stream'
export type URI = typeof URI
