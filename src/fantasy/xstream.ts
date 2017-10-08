import { Functor, map } from './typeclasses/functor'
import { Cartesian, product } from './typeclasses/cartesian'
import { Apply } from './typeclasses/apply'
import { FlatMap, flatMap } from './typeclasses/flatmap'
import { Applicative } from './typeclasses/applicative'
import { Semigroup, concat } from './typeclasses/semigroup'
import { Monad } from './typeclasses/monad'
import { streamOps, Subject, Stream } from '../xs'
import { Plan, Update } from '../interfaces'
import { FantasyX } from './fantasyx'
import { State } from './state'
import { datatype, $, HKT } from './typeclasses'

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
    type itentStream = Subject<S, I>
    type updateStream = $<S, State<A, A>>
    return new FantasyX<S, I, A, A>(
      new State<itentStream, updateStream>(intent$ => {
        let state$ = this.streamS.runA(intent$)
        return {
          s: intent$,
          a: map<S, A, State<A, A>>((a: A) => Applicative.State.pure<A, A>(a), state$)
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

Functor.State.map

export class XstreamFunctor implements Functor<"Xstream">{
  map<A, B>(f: (a: A) => B, fa: Xstream<Stream, any, A>): Xstream<Stream, any, B> {
    return new Xstream(Monad.State.map(sa => map<Stream, A, B>(f, sa), fa.streamS))
  }
}

Functor.Xstream = new XstreamFunctor

export class XstreamCartesian implements Cartesian<"Xstream">{
  product<A, B>(fa: Xstream<any, any, A>, fb: Xstream<any, any, B>): Xstream<any, typeof fa._I, [A, B]> {
    return new Xstream(
      FlatMap.State.flatMap(s1 => (
        Functor.State.map(s2 => (
          product(s1, s2)
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
  ap<A, B>(
    fab: Xstream<any, any, (a: A) => B>,
    fa: Xstream<any, any, A>
  ): Xstream<any, any, B> {
    return new Xstream(
      FlatMap.State.flatMap(s1 => (
        Functor.State.map(s2 => (
          map((([a, b]) => a(b)), product(s1, s2))
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
    return new Xstream(
      FlatMap.State.flatMap((a$: $<Stream, A>) => (
        map<"State", $<Stream, A>, $<Stream, B>>(i$ => {
          let sdf = (a: A) => f(a).streamS.runA(i$)
          return flatMap<Stream, A, B>(sdf, a$)
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
  pure<I, A>(v: A): Xstream<any, I, A> {
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


// export class XstreamSemigroup implements Semigroup<Xstream<any, any, any>> {
//   _T: Xstream<any, any, any>
//   concat(fa: Xstream<any, any, any>, fb: Xstream<any, any, any>): Xstream<any, any, any> {
//     return new Xstream(
//       fa.streamS.chain(a$ => (
//         fb.streamS.map(b$ => (
//           streamOps.combine((a: any, b: any) => {
//             return concat(a, b)
//           }, a$, b$)
//         )))))
//   }
// }

// declare module './typeclasses/semigroup' {
//   export namespace Semigroup {
//     export let Xstream: XstreamSemigroup
//   }
// }
