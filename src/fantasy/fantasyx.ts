import { Stream, streamOps, Subject } from '../xs'
import { PlanS } from './interfaces'
import { x } from '../x'
import { State } from './state'
import { Actions, Plan, XcomponentClass, Update } from '../interfaces'
import { $ } from './typeclasses'
import { map, Functor } from './typeclasses/functor'
import { FlatMap, flatMap } from './typeclasses/flatmap'
import { Monad } from './typeclasses/monad'
import { Cartesian, product } from './typeclasses/cartesian'
import { Apply } from './typeclasses/apply'
import { Applicative } from './typeclasses/applicative'
import { Traversable } from './typeclasses/traversable'
import { datatype } from './typeclasses'
import { Xstream } from './xstream'

import * as React from 'react'

@datatype('FantasyX')
export class FantasyX<F extends Stream, I, S, A> {
  plan: State<Subject<F, I>, $<F, State<S, A>>>
  constructor(plan: State<Subject<F, I>, $<F, State<S, A>>>) {
    this.plan = plan
  }

  apply(WrappedComponent: XcomponentClass<F, I, S> | React.ComponentClass<any> | React.SFC<any>, actions?: Actions<I>) {
    return x((intent$: Subject<F, I>) => {
      return { update$: this.toStream(intent$), actions }
    })(WrappedComponent)
  }

  toStream(intent$: Subject<F, I>): $<F, Update<S>> {
    return streamOps.map<State<S, A>, Update<S>>(
      s => (state => s.patch(a => a).runS(state)),
      this.plan.runA(intent$))
  }

  map<B>(f: (a: A) => B): FantasyX<F, I, S, B> {
    return new FantasyX<F, I, S, B>(
      Functor.State.map(update$ => (
        streamOps.map<State<S, A>, State<S, B>>(state => (
          Functor.State.map(f, state)
        ), update$)
      ), this.plan)
    )
  }

  foldS<B>(f: (s: S, a: A) => S): FantasyX<F, I, S, Partial<S>> {
    return new FantasyX<F, I, S, Partial<S>>(
      Functor.State.map(update$ => (
        streamOps.map<State<S, A>, State<S, Partial<S>>>(state => (
          state.patch((a: A, s: S) => f(s, a))
        ), update$)
      ), this.plan)
    )
  }

  combine<C, B>(
    f: (a: A, b: B) => C,
    fB: FantasyX<F, I, S, B>
  ): FantasyX<F, I, S, C> {
    return new FantasyX<F, I, S, C>(
      Monad.State.flatMap(updateA$ => (
        Functor.State.map(updateB$ => (
          streamOps.combine<State<S, A>, State<S, B>, State<S, C>>((S1, S2) => (
            Monad.State.flatMap(s1 => (
              Functor.State.map(s2 => (
                f(s1, s2)
              ), S2)
            ), S1)
          ), updateA$, updateB$)
        ), fB.plan)
      ), this.plan))
  }

  merge<C, B>(
    fB: FantasyX<F, I, S, B>
  ): FantasyX<F, I, S, A | B> {
    return new FantasyX<F, I, S, A | B>(
      Monad.State.flatMap(updateA$ => (
        Functor.State.map(updateB$ => (
          streamOps.merge<State<S, A>, State<S, B>>(updateA$, updateB$)
        ), fB.plan)
      ), this.plan))
  }
}

declare module './typeclasses' {
  export interface _<A> {
    "FantasyX": FantasyX<Stream, any, any, A>
  }
}

export class FantasyXFunctor implements Functor<"FantasyX"> {
  map<A, B, I, S>(f: (a: A) => B, fa: FantasyX<Stream, I, S, A>): FantasyX<Stream, I, S, B> {
    return fa.map(f)
  }
}

declare module './typeclasses/functor' {
  export namespace Functor {
    export let FantasyX: FantasyXFunctor
  }
}

Functor.FantasyX = new FantasyXFunctor

export class FantasyXCartesian implements Cartesian<"FantasyX"> {
  product<A, B, I, S>(fa: FantasyX<Stream, I, S, A>, fb: FantasyX<Stream, I, S, B>): FantasyX<Stream, I, S, [A, B]> {
    return new FantasyX(
      FlatMap.State.flatMap(s1$ => (
        Functor.State.map(s2$ => (
          streamOps.combine((a: any, b: any) => Cartesian.State.product(a, b), s1$, s2$)
        ), fb.plan)
      ), fa.plan))
  }
}

declare module './typeclasses/cartesian' {
  export namespace Cartesian {
    export let FantasyX: FantasyXCartesian
  }
}

Cartesian.FantasyX = new FantasyXCartesian

export class FantasyXApply implements Apply<"FantasyX"> {
  ap<A, B, I, S>(
    fab: FantasyX<Stream, I, S, (a: A) => B>,
    fa: FantasyX<Stream, I, S, A>
  ): FantasyX<Stream, I, S, B> {
    return new FantasyX(
      FlatMap.State.flatMap(s1$ => (
        Functor.State.map(s2$ => (
          streamOps.combine((s1: any, s2: any) => Apply.State.ap(s1, s2), s1$, s2$)
        ), fa.plan)
      ), fab.plan))
  }
  map = Functor.FantasyX.map
  product = Cartesian.FantasyX.product
}

declare module './typeclasses/apply' {
  export namespace Apply {
    export let FantasyX: FantasyXApply
  }
}

Apply.FantasyX = new FantasyXApply

export class FantasyXApplicative extends FantasyXApply {
  pure<I, A>(v: A): FantasyX<Stream, I, A, A> {
    return Applicative.Xstream.pure<I, A>(v).toFantasyX()
  }
}

declare module './typeclasses/applicative' {
  export namespace Applicative {
    export let FantasyX: FantasyXApplicative
  }
}

Applicative.FantasyX = new FantasyXApplicative
