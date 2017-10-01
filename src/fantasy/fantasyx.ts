import { Stream, streamOps } from '../xs'
import { PlanS } from './interfaces'
import { x } from '../x'
import { State } from './state'
import { Actions, Plan, XcomponentClass, Update } from '../interfaces'

interface Semigroup {
  concat: <A>(a: A) => A
}
function isSemigroup(a: any): a is Semigroup {
  return a && typeof a.concat == 'function'
}

export class FantasyX<E extends Stream, I, S, A> {
  plan: PlanS<E, I, S, A>
  constructor(plan: PlanS<E, I, S, A>) {
    this.plan = plan
  }
  apply(WrappedComponent: XcomponentClass<E, I, S>) {
    return x(this.patch().runS())(WrappedComponent)
  }

  runS(): Plan<E, I, S> {
    return intent$ => {
      let machine = this.plan(intent$)
      let update$ = streamOps.map<State<S, A>, Update<S>>(
        s => s.runS.bind(s),
        machine.update$
      )
      return { update$, actions: machine.actions }
    }
  }

  map<B>(f: (a: A) => B): FantasyX<E, I, S, B> {
    return new FantasyX<E, I, S, B>(intent$ => {
      let machine = this.plan(intent$)
      let update$ = streamOps.map<State<S, A>, State<S, B>>(
        state => state.map(f),
        machine.update$
      )
      return { update$, actions: machine.actions }
    })
  }

  fold<B>(f: (acc: B, i: A) => B, base: B): FantasyX<E, I, S, B> {
    return new FantasyX<E, I, S, B>(intent$ => {
      let machine = this.plan(intent$)
      let update$ = streamOps.merge(
        streamOps.just(State.pure<S, B>(base)),
        streamOps.scan<State<S, A>, State<S, B>>((accS, curS) => {
          return accS.chain(acc =>
            curS.chain(cur =>
              State.pure<S, B>(f(acc, cur))
            )
          )
        }, State.pure<S, B>(base), machine.update$
        )
      )
      return { update$, actions: machine.actions }
    })
  }

  combine<C, B>(
    f: (a: A, b: B) => C,
    fB: FantasyX<E, I, S, B>
  ): FantasyX<E, I, S, C> {
    return new FantasyX<E, I, S, C>(intent$ => {
      let machineB = fB.plan(intent$),
        machineA = this.plan(intent$)
      let update$ = streamOps.combine<State<S, A>, State<S, B>, State<S, C>>(
        (S1, S2) =>
          S1.chain(s1 =>
            S2.chain(s2 =>
              State.pure<S, C>(f(s1, s2))
            )
          )
        , machineA.update$, machineB.update$
      )
      let actions = Object.assign({}, machineA.actions, machineB.actions)
      return { update$, actions }
    })
  }

  patch(f: (a: A) => Partial<S> = _ => _): FantasyX<E, I, S, void> {
    return new FantasyX<E, I, S, void>(intent$ => {
      let machine = this.plan(intent$)
      let update$ = streamOps.map<State<S, A>, State<S, void>>(
        state => state.patch(f),
        machine.update$
      )
      return { update$, actions: machine.actions }
    })
  }

  bimap<B>(
    fa: (b?: Actions<I>) => Actions<I>, fb: (a: A) => B
  ): FantasyX<E, I, S, B> {
    return new FantasyX<E, I, S, B>(intent$ => {
      let machine = this.plan(intent$)
      let update$ = streamOps.map<State<S, A>, State<S, B>>(
        state => state.map(fb),
        machine.update$
      )
      return { update$, actions: fa(machine.actions) }
    })
  }

  combine3<B, C, D>(
    f: (a: A, b: B, c: C) => D,
    planB: FantasyX<E, I, S, B>,
    planC: FantasyX<E, I, S, C>
  ): FantasyX<E, I, S, D> {
    return new FantasyX<E, I, S, D>(intent$ => {
      let machineB = planB.plan(intent$),
        machineA = this.plan(intent$),
        machineC = planC.plan(intent$);
      let update$ = streamOps.combine<State<S, A>, State<S, B>, State<S, C>, State<S, D>>(
        (S1, S2, S3) =>
          S1.chain(s1 =>
            S2.chain(s2 =>
              S3.chain(s3 =>
                State.pure<S, D>(f(s1, s2, s3)))))
        , machineA.update$, machineB.update$, machineC.update$
      )
      let actions = Object.assign({}, machineA.actions, machineB.actions, machineC.actions)
      return { update$, actions }
    })
  }

  combine4<B, C, D, F>(
    f: (a: A, b: B, c: C, d: D) => F,
    planB: FantasyX<E, I, S, B>,
    planC: FantasyX<E, I, S, C>,
    planD: FantasyX<E, I, S, D>
  ): FantasyX<E, I, S, F> {
    return new FantasyX<E, I, S, F>(intent$ => {
      let machineB = planB.plan(intent$),
        machineA = this.plan(intent$),
        machineC = planC.plan(intent$),
        machineD = planD.plan(intent$)
        ;
      let update$ = streamOps.combine<State<S, A>, State<S, B>, State<S, C>, State<S, D>, State<S, F>>(
        (S1, S2, S3, S4) =>
          S1.chain(s1 =>
            S2.chain(s2 =>
              S3.chain(s3 =>
                S4.chain(s4 =>
                  State.pure<S, F>(f(s1, s2, s3, s4))))))
        , machineA.update$, machineB.update$, machineC.update$, machineD.update$
      )
      let actions = Object.assign({}, machineA.actions, machineB.actions, machineC.actions, machineD.actions)
      return { update$, actions }
    })
  }

  combine5<B, C, D, F, G>(
    f: (a: A, b: B, c: C, d: D, e: F) => G,
    planB: FantasyX<E, I, S, B>,
    planC: FantasyX<E, I, S, C>,
    planD: FantasyX<E, I, S, D>,
    planE: FantasyX<E, I, S, F>
  ): FantasyX<E, I, S, G> {
    return new FantasyX<E, I, S, G>(intent$ => {
      let machineB = planB.plan(intent$),
        machineA = this.plan(intent$),
        machineC = planC.plan(intent$),
        machineD = planD.plan(intent$),
        machineE = planE.plan(intent$)
        ;
      let update$ = streamOps.combine<State<S, A>, State<S, B>, State<S, C>, State<S, D>, State<S, F>, State<S, G>>(
        (S1, S2, S3, S4, S5) =>
          S1.chain(s1 =>
            S2.chain(s2 =>
              S3.chain(s3 =>
                S4.chain(s4 =>
                  S5.chain(s5 =>
                    State.pure<S, G>(f(s1, s2, s3, s4, s5)))))))
        , machineA.update$, machineB.update$, machineC.update$, machineD.update$, machineE.update$
      )
      let actions = Object.assign({}, machineA.actions, machineB.actions, machineC.actions, machineD.actions, machineE.actions)
      return { update$, actions }
    })
  }


  concat(
    fa: FantasyX<E, I, S, A>
  ): FantasyX<E, I, S, A> {
    return this.combine((a, b) => {
      if (isSemigroup(a) && isSemigroup(b))
        return a.concat(b)
      else
        return b
    }, fa)
  }

  merge<B>(
    fa: FantasyX<E, I, S, B>
  ): FantasyX<E, I, S, A | B> {
    return new FantasyX<E, I, S, A | B>(intent$ => {
      let machineA = this.plan(intent$)
      let machineB = fa.plan(intent$)
      let update$ = streamOps.merge<State<S, A | B>>(
        machineA.update$,
        machineB.update$
      )
      return { update$, actions: Object.assign({}, machineA.actions, machineB.actions) }
    })
  }

}
