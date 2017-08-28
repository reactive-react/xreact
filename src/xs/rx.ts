import { Observable } from '@reactivex/rxjs/dist/cjs/Observable'
import { Subject } from '@reactivex/rxjs/dist/cjs/Subject'
import { Subscription, StreamOps } from '..'
import '@reactivex/rxjs/dist/cjs/add/operator/map'
import '@reactivex/rxjs/dist/cjs/add/operator/merge'
import '@reactivex/rxjs/dist/cjs/add/operator/catch'
import '@reactivex/rxjs/dist/cjs/add/operator/filter'
import '@reactivex/rxjs/dist/cjs/add/observable/empty'
import '@reactivex/rxjs/dist/cjs/add/observable/combineLatest'

declare module '..' {
  interface HKT<A> {
    Observable: Observable<A>
  }
}

StreamOps.prototype.empty = Observable.empty

StreamOps.prototype.combine = function(f, ...v) {
  return Observable.combineLatest(v, f)
}
StreamOps.prototype.filter = function <A>(f: (a: A) => boolean, fa: Observable<A>): Observable<A> {
  return fa.filter(f)
}
StreamOps.prototype.map = function <A, B>(f: (a: A) => B, fa: Observable<A>): Observable<B> {
  return fa.map(f)
}
StreamOps.prototype.subject = function <A>() {
  return new Subject()
}

StreamOps.prototype.subscribe = function <A>(fa: Observable<A>, next: (v: A) => void, complete?: () => void) {
  return fa.catch(x => {
    console.error(x)
    return fa
  }).subscribe(next, x => console.error(x), complete) as Subscription
}

StreamOps.prototype.merge = function <A>(a: Observable<A>, b: Observable<A>): Observable<A> {
  return a.merge(b)
}
export const URI = 'Observable'
export type URI = typeof URI
