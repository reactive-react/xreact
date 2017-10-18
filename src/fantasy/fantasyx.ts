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
import { datatype } from './typeclasses'

@datatype('FantasyX')
export class FantasyX<F extends Stream, I, S, A> {
  plan: State<Subject<F, I>, $<F, State<S, A>>>
  constructor(plan: State<Subject<F, I>, $<F, State<S, A>>>) {
    this.plan = plan
  }

  apply(WrappedComponent: XcomponentClass<F, I, S>, actions?: Actions<I>) {
    return x((intent$: Subject<F, I>) => {
      return { update$: this.toStream(intent$), actions }
    })(WrappedComponent)
  }

  toStream(intent$: Subject<F, I>): $<F, Update<S>> {
    return map<Stream, State<S, A>, Update<S>>(
      s => (state => s.patch(a => a).runS(state)),
      this.plan.runA(intent$))
  }

  map<B>(f: (a: A) => B): FantasyX<F, I, S, B> {
    return new FantasyX<F, I, S, B>(
      Functor.State.map(update$ => (
        map<Stream, State<S, A>, State<S, B>>(state => (
          Functor.State.map(f, state)
        ), update$)
      ), this.plan)
    )
  }

  fold<B>(f: (s: S, a: A) => S): FantasyX<F, I, S, Partial<S>> {
    return new FantasyX<F, I, S, Partial<S>>(
      Functor.State.map(update$ => (
        map<Stream, State<S, A>, State<S, Partial<S>>>(state => (
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

  // patch(f: (a: A) => Partial<S> = _ => _): FantasyX<E, I, S, void> {
  //   return new FantasyX<E, I, S, void>(intent$ => {
  //     let machine = this.plan(intent$)
  //     let update$ = streamOps.map<State<S, A>, State<S, void>>(
  //       state => state.patch(f),
  //       machine.update$
  //     )
  //     return { update$, actions: machine.actions }
  //   })
  // }

  // bimap<B>(
  //   fa: (b?: Actions<I>) => Actions<I>, fb: (a: A) => B
  // ): FantasyX<E, I, S, B> {
  //   return new FantasyX<E, I, S, B>(intent$ => {
  //     let machine = this.plan(intent$)
  //     let update$ = streamOps.map<State<S, A>, State<S, B>>(
  //       state => state.map(fb),
  //       machine.update$
  //     )
  //     return { update$, actions: fa(machine.actions) }
  //   })
  // }

  // combine3<B, C, D>(
  //   f: (a: A, b: B, c: C) => D,
  //   planB: FantasyX<E, I, S, B>,
  //   planC: FantasyX<E, I, S, C>
  // ): FantasyX<E, I, S, D> {
  //   return new FantasyX<E, I, S, D>(intent$ => {
  //     let machineB = planB.plan(intent$),
  //       machineA = this.plan(intent$),
  //       machineC = planC.plan(intent$);
  //     let update$ = streamOps.combine<State<S, A>, State<S, B>, State<S, C>, State<S, D>>(
  //       (S1, S2, S3) =>
  //         S1.chain(s1 =>
  //           S2.chain(s2 =>
  //             S3.chain(s3 =>
  //               State.pure<S, D>(f(s1, s2, s3)))))
  //       , machineA.update$, machineB.update$, machineC.update$
  //     )
  //     let actions = Object.assign({}, machineA.actions, machineB.actions, machineC.actions)
  //     return { update$, actions }
  //   })
  // }

  // combine4<B, C, D, F>(
  //   f: (a: A, b: B, c: C, d: D) => F,
  //   planB: FantasyX<E, I, S, B>,
  //   planC: FantasyX<E, I, S, C>,
  //   planD: FantasyX<E, I, S, D>
  // ): FantasyX<E, I, S, F> {
  //   return new FantasyX<E, I, S, F>(intent$ => {
  //     let machineB = planB.plan(intent$),
  //       machineA = this.plan(intent$),
  //       machineC = planC.plan(intent$),
  //       machineD = planD.plan(intent$)
  //       ;
  //     let update$ = streamOps.combine<State<S, A>, State<S, B>, State<S, C>, State<S, D>, State<S, F>>(
  //       (S1, S2, S3, S4) =>
  //         S1.chain(s1 =>
  //           S2.chain(s2 =>
  //             S3.chain(s3 =>
  //               S4.chain(s4 =>
  //                 State.pure<S, F>(f(s1, s2, s3, s4))))))
  //       , machineA.update$, machineB.update$, machineC.update$, machineD.update$
  //     )
  //     let actions = Object.assign({}, machineA.actions, machineB.actions, machineC.actions, machineD.actions)
  //     return { update$, actions }
  //   })
  // }

  // combine5<B, C, D, F, G>(
  //   f: (a: A, b: B, c: C, d: D, e: F) => G,
  //   planB: FantasyX<E, I, S, B>,
  //   planC: FantasyX<E, I, S, C>,
  //   planD: FantasyX<E, I, S, D>,
  //   planE: FantasyX<E, I, S, F>
  // ): FantasyX<E, I, S, G> {
  //   return new FantasyX<E, I, S, G>(intent$ => {
  //     let machineB = planB.plan(intent$),
  //       machineA = this.plan(intent$),
  //       machineC = planC.plan(intent$),
  //       machineD = planD.plan(intent$),
  //       machineE = planE.plan(intent$)
  //       ;
  //     let update$ = streamOps.combine<State<S, A>, State<S, B>, State<S, C>, State<S, D>, State<S, F>, State<S, G>>(
  //       (S1, S2, S3, S4, S5) =>
  //         S1.chain(s1 =>
  //           S2.chain(s2 =>
  //             S3.chain(s3 =>
  //               S4.chain(s4 =>
  //                 S5.chain(s5 =>
  //                   State.pure<S, G>(f(s1, s2, s3, s4, s5)))))))
  //       , machineA.update$, machineB.update$, machineC.update$, machineD.update$, machineE.update$
  //     )
  //     let actions = Object.assign({}, machineA.actions, machineB.actions, machineC.actions, machineD.actions, machineE.actions)
  //     return { update$, actions }
  //   })
  // }


  // concat(
  //   fa: FantasyX<E, I, S, A>
  // ): FantasyX<E, I, S, A> {
  //   return this.combine((a, b) => {
  //     if (isSemigroup(a) && isSemigroup(b))
  //       return a.concat(b)
  //     else
  //       return b
  //   }, fa)
  // }

  // merge<B>(
  //   fa: FantasyX<E, I, S, B>
  // ): FantasyX<E, I, S, A | B> {
  //   return new FantasyX<E, I, S, A | B>(intent$ => {
  //     let machineA = this.plan(intent$)
  //     let machineB = fa.plan(intent$)
  //     let update$ = streamOps.merge<State<S, A | B>>(
  //       machineA.update$,
  //       machineB.update$
  //     )
  //     return { update$, actions: Object.assign({}, machineA.actions, machineB.actions) }
  //   })
  // }

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
          streamOps.combine((a, b) => Cartesian.State.product(a, b), s1$, s2$)
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
          streamOps.combine((s1, s2) => Apply.State.ap(s1, s2), s1$, s2$)
        ), fa.plan)
      ), fab.plan))
  }
  map = Functor.FantasyX.map
  product = Cartesian.FantasyX.product
}

declare module './typeclasses/apply' {
  export namespace Apply {
    export let FantasyX: FantasyXFunctor
  }
}

Apply.FantasyX = new FantasyXFunctor

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
