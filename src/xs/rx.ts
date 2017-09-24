import { Observable as RxStream } from '@reactivex/rxjs/dist/cjs/Observable'
import { Subject } from '@reactivex/rxjs/dist/cjs/Subject'
import { Subscription, StreamOps } from './index'
import '@reactivex/rxjs/dist/cjs/add/operator/map'
import '@reactivex/rxjs/dist/cjs/add/operator/merge'
import '@reactivex/rxjs/dist/cjs/add/operator/scan'
import '@reactivex/rxjs/dist/cjs/add/operator/catch'
import '@reactivex/rxjs/dist/cjs/add/operator/filter'
import '@reactivex/rxjs/dist/cjs/add/observable/empty'
import '@reactivex/rxjs/dist/cjs/add/observable/of'

import '@reactivex/rxjs/dist/cjs/add/observable/combineLatest'

declare module './index' {
  interface M_<A> {
    '@reactivex/rxjs': RxStream<A>
  }
}

export const URI = '@reactivex/rxjs'
export type URI = typeof URI

StreamOps.prototype.empty = RxStream.empty

StreamOps.prototype.just = RxStream.of

StreamOps.prototype.scan = function(f, base, fa) {
  return fa.scan(f, base)
}
StreamOps.prototype.combine = function(f, ...v) {
  return RxStream.combineLatest(v, f)
}
StreamOps.prototype.filter = function <A>(f: (a: A) => boolean, fa: RxStream<A>): RxStream<A> {
  return fa.filter(f)
}
StreamOps.prototype.map = function <A, B>(f: (a: A) => B, fa: RxStream<A>): RxStream<B> {
  return fa.map(f)
}
StreamOps.prototype.subject = function <A>() {
  return new Subject()
}

StreamOps.prototype.subscribe = function <A>(fa: RxStream<A>, next: (v: A) => void, complete?: () => void) {
  return fa.catch(x => {
    console.error(x)
    return fa
  }).subscribe(next, x => console.error(x), complete) as Subscription
}

StreamOps.prototype.merge = function <A>(a: RxStream<A>, b: RxStream<A>): RxStream<A> {
  return a.merge(b)
}
