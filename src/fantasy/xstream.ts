import { Functor } from './typeclasses/functor'
import { Cartesian } from './typeclasses/cartesian'
import { Apply } from './typeclasses/apply'
import { FlatMap } from './typeclasses/flatmap'
import { Applicative } from './typeclasses/applicative'
import { Semigroup, concat } from './typeclasses/semigroup'
import { Monad } from './typeclasses/monad'
import { Stream, streamOps, $, Subject } from '../xs'
import { Plan, Update } from '../interfaces'
import { FantasyX } from './fantasyx'
import { State } from './state'
import { datatype } from './typeclasses'

@datatype('Xstream')
export class Xstream<S extends Stream, I, A> {
  _S: S
  _V: A
  _I: I
  streamS: State<$<S, I>, $<S, A>>
  constructor(streamS: State<$<S, I>, $<S, A>>) {
    this.streamS = streamS
  }
  static fromIntent<F extends Stream, I>() {
    return new Xstream<F, I, I>(new State((intent$: Subject<F, I>) => ({
      s: intent$,
      a: intent$
    })))
  }

  toFantasyX() {
    return new FantasyX<S, I, A, A>((intent$: Subject<S, I>) => {
      let state$ = this.streamS.runA(intent$)
      return {
        update$: streamOps.map((a: A) => State.pure<A, A>(a), state$)
      }
    })
  }

  map<B>(f: (a: A) => B): Xstream<S, I, B> {
    return new Xstream(this.streamS.map(sa => streamOps.map(f, sa)))
  }

  product<B>(fa: Xstream<Stream, I, A>, fb: Xstream<Stream, I, B>): Xstream<Stream, I, [A, B]> {
    return new Xstream(fa.streamS.chain(s1 => (
      fb.streamS.map(s2 => (
        streamOps.combine((a, b) => (<[A, B]>[a, b]), s1, s2)
      ))
    )))
  }
}

declare module './typeclasses' {
  export interface _<A> {
    "Xstream": Xstream<Stream, any, A>
  }
}

export class XstreamFunctor implements Functor<"Xstream">{
  map<A, B>(f: (a: A) => B, fa: Xstream<Stream, any, A>): Xstream<typeof fa._S, typeof fa._I, B> {
    return new Xstream(fa.streamS.map(sa => streamOps.map(f, sa)))
  }
}

Functor.Xstream = new XstreamFunctor

declare module './typeclasses/functor' {
  namespace Functor {
    export let Xstream: XstreamFunctor
  }
}

export class XstreamCartesian implements Cartesian<"Xstream">{
  product<A, B>(fa: Xstream<Stream, any, A>, fb: Xstream<Stream, any, B>): Xstream<Stream, typeof fa._I, [A, B]> {
    return new Xstream(
      fa.streamS.chain(
        s1 => fb.streamS.map(
          s2 => streamOps.combine((a, b) => (<[A, B]>[a, b]), s1, s2))))
  }
}

Cartesian.Xstream = new XstreamCartesian

declare module './typeclasses/cartesian' {
  export namespace Cartesian {
    export let Xstream: XstreamCartesian
  }
}

export class XstreamApply implements Apply<"Xstream"> {
  ap<A, B>(
    fab: Xstream<Stream, any, (a: A) => B>,
    fa: Xstream<Stream, any, A>
  ): Xstream<typeof fa._S, typeof fa._I, B> {
    return new Xstream(
      fab.streamS.chain(s1 => (
        fa.streamS.map(s2 => (
          streamOps.combine((a, b) => a(b), s1, s2))
        ))))
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
  flatMap<A, B>(f: (a: A) => Xstream<Stream, any, B>, fa: Xstream<Stream, any, A>): Xstream<typeof fa._S, typeof fa._I, B> {
    return new Xstream(
      fa.streamS.chain(a$ => (
        State.get<typeof fa._I>().map(i$ => (
          streamOps.flatMap(a => f(a).streamS.runA(i$), a$)
        ))
      ))
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
      State.pure<$<Stream, I>, $<Stream, A>>(streamOps.just(v))
    )
  }
}

Applicative.Xstream = new XstreamApplicative

declare module './typeclasses/applicative' {
  export namespace Applicative {
    export let Xstream: XstreamApplicative
  }
}

export class XstreamMonad implements Applicative<"Xstream">, FlatMap<"Xstream"> {
  flatMap = FlatMap.Xstream.flatMap
  map = Applicative.Xstream.map
  ap = Applicative.Xstream.ap
  pure = Applicative.Xstream.pure
  product = Applicative.Xstream.product
}

Monad.Xstream = new XstreamMonad

declare module './typeclasses/monad' {
  export namespace Monad {
    export let Xstream: XstreamMonad
  }
}


export class XstreamSemigroup implements Semigroup<Xstream<Stream, any, any>> {
  _T: Xstream<Stream, any, any>
  concat(fa: Xstream<Stream, any, any>, fb: Xstream<Stream, any, any>): Xstream<Stream, any, any> {
    return new Xstream(
      fa.streamS.chain(a$ => (
        fb.streamS.map(b$ => (
          streamOps.combine((a: any, b: any) => {
            return concat(a, b)
          }, a$, b$)
        )))))
  }
}

declare module './typeclasses/semigroup' {
  export namespace Semigroup {
    export let Xstream: XstreamSemigroup
  }
}
