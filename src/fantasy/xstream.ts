import { Functor, FunctorInstances, map } from './typeclasses/functor'
import { Cartesian, product } from './typeclasses/cartesian'
import { Apply } from './typeclasses/apply'
import { FlatMap, flatMap } from './typeclasses/flatmap'
import { Applicative } from './typeclasses/applicative'
import { Semigroup, concat, SemigroupInstanceType } from './typeclasses/semigroup'
import { Monad } from './typeclasses/monad'
import { streamOps, Subject, Stream } from '../xs'
import { Plan, Update } from '../interfaces'
import { FantasyX } from './fantasyx'
import { State } from './state'
import { datatype, $, HKT } from './typeclasses'

@datatype('Xstream')
export class Xstream<S extends Stream, I, A> {
  streamS: State<$<S, I>, $<S, A>>
  constructor(streamS: State<$<S, I>, $<S, A>>) {
    this.streamS = streamS
  }

  filter(f: (a: A) => boolean): Xstream<S, I, A> {
    return new Xstream(Monad.State.map(sa => streamOps.filter(f, sa), this.streamS))
  }

  static fromIntent<F extends Stream, I>() {
    return new Xstream<F, I, I>(new State((intent$: $<F, I>) => ({
      s: intent$,
      a: intent$
    })))
  }

  static fromEvent<F extends Stream>(type: string, name: string, defaultValue?: string) {
    return new Xstream<F, Event, string>(new State((intent$: $<F, Event>) => ({
      s: intent$,
      a: streamOps.merge(
        typeof defaultValue != 'undefined' ? streamOps.just(defaultValue) : streamOps.empty()
        ,
        streamOps.map((e: Event) => (e.target as HTMLFormElement).value
          , streamOps.filter((e: Event) => {
            let target = e.target as HTMLFormElement
            return target.tagName == 'INPUT' && e.type == type && target.name == name
          }, (intent$ as $<F, Event>)))

      )
    })))
  }

  static fromPromise<F extends Stream, I, A>(p: Promise<A>) {
    return new Xstream<F, I, A>(new State((intent$: $<F, I>) => ({
      s: intent$,
      a: streamOps.fromPromise(p)
    })))
  }

  static from<F extends Stream, I, A, G extends FunctorInstances>(p: $<G, A>) {
    return new Xstream<F, I, A>(new State((intent$: $<F, I>) => ({
      s: intent$,
      a: streamOps.from(p) as $<F, A>
    })))
  }

  toFantasyX<St>() {
    type itentStream = Subject<S, I>
    type updateStream = $<S, State<St, A>>
    return new FantasyX<S, I, St, A>(
      new State<itentStream, updateStream>(intent$ => {
        let state$ = this.streamS.runA(intent$)
        return {
          s: intent$,
          a: streamOps.map<A, State<St, A>>((a: A) => Applicative.State.pure<St, A>(a), state$)
        }
      }))
  }
}

declare module './typeclasses' {
  export interface _<A> {
    "Xstream": Xstream<any, any, A>
  }
}

declare module './typeclasses/functor' {
  export namespace Functor {
    export let Xstream: XstreamFunctor
  }
}

export class XstreamFunctor implements Functor<"Xstream">{
  map<A, B>(f: (a: A) => B, fa: Xstream<Stream, any, A>): Xstream<Stream, any, B> {
    return new Xstream(Monad.State.map(sa => streamOps.map<A, B>(f, sa), fa.streamS))
  }
}

Functor.Xstream = new XstreamFunctor

export class XstreamCartesian implements Cartesian<"Xstream">{
  product<A, B, C extends Stream, D>(fa: Xstream<C, D, A>, fb: Xstream<C, D, B>): Xstream<C, D, [A, B]> {
    return new Xstream(
      FlatMap.State.flatMap(s1 => (
        Functor.State.map(s2 => (
          streamOps.combine<A, B, [A, B]>((a, b) => [a, b], s1, s2)
        ), fb.streamS)
      ), fa.streamS))
  }
}

Cartesian.Xstream = new XstreamCartesian

declare module './typeclasses/cartesian' {
  export namespace Cartesian {
    export let Xstream: XstreamCartesian
  }
}

export class XstreamApply implements Apply<"Xstream"> {
  ap<A, B, F extends Stream>(
    fab: Xstream<F, any, (a: A) => B>,
    fa: Xstream<F, any, A>
  ): Xstream<F, any, B> {
    return new Xstream(
      FlatMap.State.flatMap(s1 => (
        Functor.State.map(s2 => (
          streamOps.combine<(a: A) => B, A, B>((a, b) => a(b), s1, s2)
        ), fa.streamS)
      ), fab.streamS))
  }
  map = Functor.Xstream.map
  product = Cartesian.Xstream.product
}

Apply.Xstream = new XstreamApply

declare module './typeclasses/apply' {
  export namespace Apply {
    export let Xstream: XstreamApply
  }
}

export class XstreamFlatMap extends XstreamApply {
  flatMap<A, B>(f: (a: A) => Xstream<Stream, any, B>, fa: Xstream<Stream, any, A>): Xstream<Stream, any, B> {
    return new Xstream<Stream, any, B>(
      FlatMap.State.flatMap((a$: $<Stream, A>) => (
        map<"State", $<Stream, A>, $<Stream, B>>(i$ => {
          let sdf = (a: A) => f(a).streamS.runA(i$)
          return streamOps.flatMap<A, B>(sdf, a$)
        }, State.get<$<Stream, A>>())
      ), fa.streamS)
    )
  }
}

FlatMap.Xstream = new XstreamFlatMap

declare module './typeclasses/flatmap' {
  export namespace FlatMap {
    export let Xstream: XstreamFlatMap
  }
}

export class XstreamApplicative extends XstreamApply {
  pure<I, A>(v: A): Xstream<Stream, I, A> {
    return new Xstream(
      Applicative.State.pure(streamOps.just(v))
    )
  }
}

Applicative.Xstream = new XstreamApplicative

declare module './typeclasses/applicative' {
  export namespace Applicative {
    export let Xstream: XstreamApplicative
  }
}

export class XstreamMonad extends XstreamApplicative implements FlatMap<"Xstream"> {
  flatMap = FlatMap.Xstream.flatMap
}

Monad.Xstream = new XstreamMonad

declare module './typeclasses/monad' {
  export namespace Monad {
    export let Xstream: XstreamMonad
  }
}

export class XstreamSemigroup implements Semigroup<Xstream<any, any, any>> {
  _T: Xstream<any, any, any>
  concat<A extends SemigroupInstanceType>(fa: Xstream<any, any, A>, fb: Xstream<any, any, A>): Xstream<any, any, A> {
    return Functor.Xstream.map(
      ([a, b]) => concat(a, b)
      , Cartesian.Xstream.product(fa, fb))
  }
}

Semigroup.Xstream = new XstreamSemigroup

declare module './typeclasses/semigroup' {
  export namespace Semigroup {
    export let Xstream: XstreamSemigroup
  }
}
