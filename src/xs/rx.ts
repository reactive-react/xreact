import { Observable as RxStream } from '@reactivex/rxjs/dist/cjs/Observable'
import { Subject } from '@reactivex/rxjs/dist/cjs/Subject'
import { Subscription, StreamOps } from './index'
import '@reactivex/rxjs/dist/cjs/add/operator/map'
import '@reactivex/rxjs/dist/cjs/add/operator/merge'
import '@reactivex/rxjs/dist/cjs/add/operator/mergeMap'
import '@reactivex/rxjs/dist/cjs/add/operator/scan'
import '@reactivex/rxjs/dist/cjs/add/operator/catch'
import '@reactivex/rxjs/dist/cjs/add/operator/filter'
import '@reactivex/rxjs/dist/cjs/add/observable/empty'
import '@reactivex/rxjs/dist/cjs/add/observable/from'
import '@reactivex/rxjs/dist/cjs/add/observable/of'
import '@reactivex/rxjs/dist/cjs/add/observable/fromPromise'
import '@reactivex/rxjs/dist/cjs/add/observable/combineLatest'

declare module '.' {
  interface S_<A> {
    'RxStream': RxStream<A>
  }
}

declare module '../fantasy/typeclasses' {
  interface _<A> {
    'RxStream': RxStream<A>
  }
}

StreamOps.prototype.empty = RxStream.empty

StreamOps.prototype.just = RxStream.of

StreamOps.prototype.scan = function(f, base, fa) {
  return fa.scan(f, base)
}
StreamOps.prototype.combine = function <A, C>(
  f: (...a: any[]) => C,
  ...v: RxStream<any>[]
): RxStream<C> {
  return RxStream.combineLatest(v, f)
}
StreamOps.prototype.filter = function <A>(f: (a: A) => boolean, fa: RxStream<A>): RxStream<A> {
  return fa.filter(f)
}
StreamOps.prototype.map = function <A, B>(f: (a: A) => B, fa: RxStream<A>): RxStream<B> {
  return fa.map(f)
}
StreamOps.prototype.flatMap = function <A, B>(f: (a: A) => RxStream<B>, fa: RxStream<A>): RxStream<B> {
  return fa.mergeMap(f)
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

StreamOps.prototype.merge = function <A, B>(a: RxStream<A>, b: RxStream<B>): RxStream<A | B> {
  return a.merge<A, B>(b)
}

StreamOps.prototype.fromPromise = RxStream.fromPromise;

(<any>StreamOps.prototype.from) = RxStream.from
