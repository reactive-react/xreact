import { Functor } from './typeclasses/functor'
import { Cartesian } from './typeclasses/cartesian'
import { Apply } from './typeclasses/apply'
import { FlatMap } from './typeclasses/flatmap'
import { Applicative } from './typeclasses/applicative'
import { Semigroup, concat, instances } from './typeclasses/semigroup'
import { Monad } from './typeclasses/monad'
import { Stream, streamOps, $ } from '../xs'
import { Plan, Update } from '../interfaces'
import { FantasyX} from './fantasyx'
export class XSTREAM<S extends Stream, Actions, Values>{
  _S: S
  _V: Values
  actions: Actions
  stream$: $<S, Values>
  constructor(actions: Actions, stream$: $<S, Values>) {
    this.actions = actions
    this.stream$ = stream$
  }
  toFantasy() {

  }
}

export type Xstream<A> = XSTREAM<Stream, any, A>

declare module './typeclasses' {
  export interface _<A> {
    "Xstream": Xstream<A>
  }
}

export class XstreamFunctor implements Functor<"Xstream">{
  map<A, B, C>(f: (a: A) => B, fa: XSTREAM<Stream, C, A>): XSTREAM<typeof fa._S, typeof fa.actions, B> {
    return new XSTREAM(fa.actions, streamOps.map(f, fa.stream$))
  }
}

Functor.Xstream = new XstreamFunctor

declare module './typeclasses/functor' {
  export namespace Functor {
    export let Xstream: XstreamFunctor
  }
}

export class XstreamCartesian implements Cartesian<"Xstream">{
  product<A, B>(fa: Xstream<A>, fb: Xstream<B>): Xstream<[A, B]> {
    return new XSTREAM(Object.assign({}, fa.actions, fb.actions),
      streamOps.combine((a, b) => (<[A, B]>[a, b]), fa.stream$, fb.stream$))
  }
}

Cartesian.Xstream = new XstreamCartesian

declare module './typeclasses/cartesian' {
  export namespace Cartesian {
    export let Xstream: XstreamCartesian
  }
}

export class XstreamApply implements Apply<"Xstream"> {
  ap<A, B, C>(fab: XSTREAM<Stream, C, (a: A) => B>, fa: XSTREAM<Stream, C, A>): XSTREAM<typeof fa._S, typeof fa.actions, B> {
    return new XSTREAM(Object.assign({}, fab.actions, fa.actions),
      streamOps.combine((a, b) => a(b), fab.stream$, fa.stream$))
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
  flatMap<A, B, C>(f: (a: A) => XSTREAM<Stream, C, B>, fa: XSTREAM<Stream, C, A>): XSTREAM<typeof fa._S, typeof fa.actions, B> {
    return new XSTREAM(fa.actions,
      streamOps.flatMap(a => f(a).stream$, fa.stream$))
  }
}

FlatMap.Xstream = new XstreamFlatMap

declare module './typeclasses/flatmap' {
  export namespace FlatMap {
    export let Xstream: XstreamFlatMap
  }
}

export class XstreamApplicative extends XstreamApply {
  pure<A, C>(v: A): XSTREAM<Stream, {}, A> {
    return new XSTREAM({},
      streamOps.just(v))
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


export class XstreamSemigroup implements Semigroup<Xstream<any>> {
  _T: Xstream<any>
  concat(fa: any, fb: any): Xstream<any> {
    return new XSTREAM(Object.assign({}, fa.actions, fb.actions),
      streamOps.combine((a: any, b: any) => {
        return concat(a,b)
      }, fa.stream$, fb.stream$))
  }
}

declare module './typeclasses/semigroup' {
  export namespace Semigroup {
    export let Xstream: XstreamSemigroup
  }
}

// Semigroup.Xstream.concat
