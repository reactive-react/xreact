import { Stream as MostStream, empty, just, combineArray, combine, flatMap, fromPromise } from 'most'
import { sync, SyncSubject, Subject } from 'most-subject'
import { Subscription, StreamOps } from '.'
import { Functor } from '../fantasy/typeclasses/functor'
import { Cartesian } from '../fantasy/typeclasses/cartesian'
import { Apply } from '../fantasy/typeclasses/apply'
import { FlatMap } from '../fantasy/typeclasses/flatmap'
import { Applicative } from '../fantasy/typeclasses/applicative'
import { Monad } from '../fantasy/typeclasses/monad'
import { datatype } from '../fantasy/typeclasses'

export const kind = 'MostStream'
export type kind = typeof kind

declare module '.' {
  interface S_<A> {
    'MostStream': MostStream<A>
  }
}


declare module '../fantasy/typeclasses' {
  interface _<A> {
    'MostStream': MostStream<A>
  }
}

datatype(kind)(MostStream)

export class MostFunctor implements Functor<kind>{
  map<A, B>(f: (a: A) => B, fa: MostStream<A>): MostStream<B> {
    return fa.map(f)
  }
}

declare module '../fantasy/typeclasses/functor' {
  namespace Functor {
    let MostStream: MostFunctor
  }
}

Functor.MostStream = new MostFunctor

export class MostCartesian implements Cartesian<kind>{
  product<A, B>(fa: MostStream<A>, fb: MostStream<B>): MostStream<[A, B]> {
    return combine((a, b) => [a, b] as [A, B], fa, fb)
  }
}

declare module '../fantasy/typeclasses/cartesian' {
  export namespace Cartesian {
    export let MostStream: MostCartesian
  }
}

Cartesian.MostStream = new MostCartesian

export class MostApply implements Apply<kind> {
  ap<A, B>(fab: MostStream<(a: A) => B>, fa: MostStream<A>): MostStream<B> {
    return combine((ab, a) => ab(a), fab, fa)
  }
  map = Functor.MostStream.map
  product = Cartesian.MostStream.product
}

declare module '../fantasy/typeclasses/apply' {
  namespace Apply {
    export let MostStream: MostApply
  }
}


export class MostFlatMap extends MostApply {
  flatMap<A, B>(f: (a: A) => MostStream<B>, fa: MostStream<A>): MostStream<B> {
    return flatMap(f, fa)
  }
}

FlatMap.MostStream = new MostFlatMap

declare module '../fantasy/typeclasses/flatmap' {
  export namespace FlatMap {
    export let MostStream: MostFlatMap
  }
}

export class MostApplicative extends MostApply {
  pure<A>(v: A): MostStream<A> {
    return just(v)
  }
}

Applicative.MostStream = new MostApplicative

declare module '../fantasy/typeclasses/applicative' {
  export namespace Applicative {
    export let MostStream: MostApplicative
  }
}

export class MostMonad implements Monad<kind> {
  flatMap = FlatMap.MostStream.flatMap
  map = Applicative.MostStream.map
  ap = Applicative.MostStream.ap
  pure = Applicative.MostStream.pure
  product = Applicative.MostStream.product
}

Monad.MostStream = new MostMonad

declare module '../fantasy/typeclasses/monad' {
  export namespace Monad {
    export let MostStream: MostMonad
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

StreamOps.prototype.subject = function <A>() {
  return sync()
}

StreamOps.prototype.subscribe = function <A>(fa: MostStream<A>, next: (v: A) => void, complete: () => void) {
  return fa.recoverWith(x => {
    console.error(x)
    return fa
  }).subscribe({ next, error: x => console.error(x), complete }) as Subscription
}

StreamOps.prototype.fromPromise = fromPromise

export const URI = 'Stream'
export type URI = typeof URI
