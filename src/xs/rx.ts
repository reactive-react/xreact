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
import '@reactivex/rxjs/dist/cjs/add/observable/of'

import '@reactivex/rxjs/dist/cjs/add/observable/combineLatest'
import { Functor } from '../fantasy/typeclasses/functor'
import { Cartesian } from '../fantasy/typeclasses/cartesian'
import { Apply } from '../fantasy/typeclasses/apply'
import { FlatMap } from '../fantasy/typeclasses/flatmap'
import { Applicative } from '../fantasy/typeclasses/applicative'
import { Monad } from '../fantasy/typeclasses/monad'
import { datatype } from '../fantasy/typeclasses'

export const kind = 'RxStream'
export type kind = typeof kind

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

datatype("RxStream")(RxStream)

export class RxFunctor implements Functor<kind>{
  map<A, B>(f: (a: A) => B, fa: RxStream<A>): RxStream<B> {
    return fa.map(f)
  }
}

declare module '../fantasy/typeclasses/functor' {
  namespace Functor {
    let RxStream: RxFunctor
  }
}

Functor.RxStream = new RxFunctor

export class RxCartesian implements Cartesian<kind>{
  product<A, B>(fa: RxStream<A>, fb: RxStream<B>): RxStream<[A, B]> {
    return RxStream.combineLatest(fa, fb, (a, b) => [a, b] as [A, B])
  }
}

declare module '../fantasy/typeclasses/cartesian' {
  namespace Cartesian {
    export let RxStream: RxCartesian
  }
}

Cartesian.RxStream = new RxCartesian

export class RxApply implements Apply<kind> {
  ap<A, B>(fab: RxStream<(a: A) => B>, fa: RxStream<A>): RxStream<B> {
    return RxStream.combineLatest(fab, fa, (ab, a) => ab(a))
  }
  map = Functor.RxStream.map
  product = Cartesian.RxStream.product
}

declare module '../fantasy/typeclasses/apply' {
  namespace Apply {
    export let RxStream: RxApply
  }
}


export class RxFlatMap extends RxApply {
  flatMap<A, B>(f: (a: A) => RxStream<B>, fa: RxStream<A>): RxStream<B> {
    return fa.mergeMap(f)
  }
}

FlatMap.RxStream = new RxFlatMap

declare module '../fantasy/typeclasses/flatmap' {
  export namespace FlatMap {
    export let RxStream: RxFlatMap
  }
}

export class RxApplicative extends RxApply {
  pure<A>(v: A): RxStream<A> {
    return RxStream.of(v)
  }
}

Applicative.RxStream = new RxApplicative

declare module '../fantasy/typeclasses/applicative' {
  export namespace Applicative {
    export let RxStream: RxApplicative
  }
}

export class RxMonad implements Monad<kind> {
  flatMap = FlatMap.RxStream.flatMap
  map = Applicative.RxStream.map
  ap = Applicative.RxStream.ap
  pure = Applicative.RxStream.pure
  product = Applicative.RxStream.product
}

Monad.RxStream = new RxMonad

declare module '../fantasy/typeclasses/monad' {
  export namespace Monad {
    export let RxStream: RxMonad
  }
}


export const URI = '@reactivex/rxjs'
export type URI = typeof URI

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

StreamOps.prototype.merge = function <A>(a: RxStream<A>, b: RxStream<A>): RxStream<A> {
  return a.merge(b)
}
