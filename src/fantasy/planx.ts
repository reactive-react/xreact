import { Stream, streamOps } from '../xs'
import { State } from './state'
import { StateP, PlanS } from './interfaces'
import { Actions, Plan, Update } from '../interfaces'

// function chainAll(chainables, f, paras) {
//   if (chainables.length == 1) {
//     return chainables[0].chain(s => {
//       return State.pure(f.apply(null, paras))
//     })
//   } else {
//     let [head, ...tail] = chainables
//     return head.chain(s => {
//       return chainAll(tail, f, paras.concat(s))
//     })
//   }
// }

interface Semigroup {
  concat: <A>(a: A) => A
}
function isSemigroup(a: any): a is Semigroup {
  return a && typeof a.concat == 'function'
}

export class PlanX<E extends Stream, I, S, A> {
  apply: PlanS<E, I, S, A>
  constructor(plan: PlanS<E, I, S, A>) {
    this.apply = plan
  }

  combine<C, B>(
    f: (a: A, b: B) => C,
    planB: PlanX<E, I, S, B>
  ): PlanX<E, I, S, C> {
    return new PlanX<E, I, S, C>(intent$ => {
      let machineB = planB.apply(intent$),
        machineA = this.apply(intent$)
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

  combine3<B, C, D>(
    f: (a: A, b: B, c: C) => D,
    planB: PlanX<E, I, S, B>,
    planC: PlanX<E, I, S, C>
  ): PlanX<E, I, S, D> {
    return new PlanX<E, I, S, D>(intent$ => {
      let machineB = planB.apply(intent$),
        machineA = this.apply(intent$),
        machineC = planC.apply(intent$);
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
    planB: PlanX<E, I, S, B>,
    planC: PlanX<E, I, S, C>,
    planD: PlanX<E, I, S, D>
  ): PlanX<E, I, S, F> {
    return new PlanX<E, I, S, F>(intent$ => {
      let machineB = planB.apply(intent$),
        machineA = this.apply(intent$),
        machineC = planC.apply(intent$),
        machineD = planD.apply(intent$)
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
    planB: PlanX<E, I, S, B>,
    planC: PlanX<E, I, S, C>,
    planD: PlanX<E, I, S, D>,
    planE: PlanX<E, I, S, F>
  ): PlanX<E, I, S, G> {
    return new PlanX<E, I, S, G>(intent$ => {
      let machineB = planB.apply(intent$),
        machineA = this.apply(intent$),
        machineC = planC.apply(intent$),
        machineD = planD.apply(intent$),
        machineE = planE.apply(intent$)
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
    fa: PlanX<E, I, S, A>
  ): PlanX<E, I, S, A> {
    return this.combine((a, b) => {
      if (isSemigroup(a) && isSemigroup(b))
        return a.concat(b)
      else
        return b
    }, fa)
  }

  merge<B>(
    fa: PlanX<E, I, S, B>
  ): PlanX<E, I, S, A | B> {
    return new PlanX<E, I, S, A | B>(intent$ => {
      let machineA = this.apply(intent$)
      let machineB = fa.apply(intent$)
      let update$ = streamOps.merge<State<S, A | B>>(
        machineA.update$,
        machineB.update$
      )
      return { update$, actions: Object.assign({}, machineA.actions, machineB.actions) }
    })
  }

  map<B>(f: (a: A) => B): PlanX<E, I, S, B> {
    return new PlanX<E, I, S, B>(intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<State<S, A>, State<S, B>>(
        state => state.map(f),
        machine.update$
      )
      return { update$, actions: machine.actions }
    })
  }

  fold<B>(f: (acc: B, i: A) => B, base: B): PlanX<E, I, S, B> {
    return new PlanX<E, I, S, B>(intent$ => {
      let machine = this.apply(intent$)
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

  patch(f: (a: A) => Partial<S> = _ => _): PlanX<E, I, S, void> {
    return new PlanX<E, I, S, void>(intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<State<S, A>, State<S, void>>(
        state => state.patch(f),
        machine.update$
      )
      return { update$, actions: machine.actions }
    })
  }

  bimap<B>(
    fa: (b?: Actions<I>) => Actions<I>, fb: (a: A) => B
  ): PlanX<E, I, S, B> {
    return new PlanX<E, I, S, B>(intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<State<S, A>, State<S, B>>(
        state => state.map(fb),
        machine.update$
      )
      return { update$, actions: fa(machine.actions) }
    })
  }

  toPlan(): Plan<E, I, S> {
    return intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<State<S, A>, Update<S>>(
        s => s.runS.bind(s),
        machine.update$
      )
      return { update$, actions: machine.actions }
    }
  }
}
