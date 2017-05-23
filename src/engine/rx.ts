import { Observable } from '@reactivex/rxjs/dist/cjs/Observable'
import { Subject } from '@reactivex/rxjs/dist/cjs/Subject'
import { StaticStream, Subscription } from './index'
import '@reactivex/rxjs/dist/cjs/add/operator/map'
import '@reactivex/rxjs/dist/cjs/add/observable/merge'
export const URI = 'Observable'
export type URI = typeof URI

declare module './index' {
  interface HKT<A> {
    Observable: Observable<A>
  }
}

export function map<A, B>(f: (a: A) => B, fa: Observable<A>): Observable<B> {
  return fa.map(f)
}
export function subject<A>() {
  return new Subject()
}

export function subscribe<A>(fa: Observable<A>, next: (v: A) => void, complete: () => void) {
  return fa.subscribe(next, x => console.error(x), complete) as Subscription
}

export function merge<A>(a: Observable<A>, b: Observable<A>): Observable<A> {
  return Observable.merge(a, b)
}
