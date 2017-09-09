import { HKTS, streamOps } from '../xs'
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

export class PlanX<E extends HKTS, I, A> {
  apply: PlanS<E, I, A>
  constructor(plan: PlanS<E, I, A>) {
    this.apply = plan
  }

  combine(
    f: (a: Partial<A>, b: Partial<A>) => Partial<A>,
    planB: PlanX<E, I, A>
  ): PlanX<E, I, A> {
    return new PlanX<E, I, A>(intent$ => {
      let machineB = planB.apply(intent$),
        machineA = this.apply(intent$)
      let update$ = streamOps.combine<StateP<A>, StateP<A>, StateP<A>>(
        (S1, S2) =>
          S1.chain(s1 =>
            S2.chain(s2 =>
              State.patch<A>(() => f(s1, s2))
            )
          )
        , machineA.update$, machineB.update$
      )
      let actions = Object.assign({}, machineA.actions, machineB.actions)
      return { update$, actions }
    })
  }

  combine3(
    f: (a: Partial<A>, b: Partial<A>, c: Partial<A>) => Partial<A>,
    planB: PlanX<E, I, A>,
    planC: PlanX<E, I, A>
  ): PlanX<E, I, A> {
    return new PlanX<E, I, A>(intent$ => {
      let machineB = planB.apply(intent$),
        machineA = this.apply(intent$),
        machineC = planC.apply(intent$);
      let update$ = streamOps.combine<StateP<A>, StateP<A>, StateP<A>, StateP<A>>(
        (S1, S2, S3) =>
          S1.chain(s1 =>
            S2.chain(s2 =>
              S3.chain(s3 =>
                State.patch<A>(() => f(s1, s2, s3)))))
        , machineA.update$, machineB.update$, machineC.update$
      )
      let actions = Object.assign({}, machineA.actions, machineB.actions, machineC.actions)
      return { update$, actions }
    })
  }

  combine4(
    f: (a: Partial<A>, b: Partial<A>, c: Partial<A>, d: Partial<A>) => Partial<A>,
    planB: PlanX<E, I, A>,
    planC: PlanX<E, I, A>,
    planD: PlanX<E, I, A>
  ): PlanX<E, I, A> {
    return new PlanX<E, I, A>(intent$ => {
      let machineB = planB.apply(intent$),
        machineA = this.apply(intent$),
        machineC = planC.apply(intent$),
        machineD = planD.apply(intent$)
        ;
      let update$ = streamOps.combine<StateP<A>, StateP<A>, StateP<A>, StateP<A>, StateP<A>>(
        (S1, S2, S3, S4) =>
          S1.chain(s1 =>
            S2.chain(s2 =>
              S3.chain(s3 =>
                S4.chain(s4 =>
                  State.patch<A>(() => f(s1, s2, s3, s4))))))
        , machineA.update$, machineB.update$, machineC.update$, machineD.update$
      )
      let actions = Object.assign({}, machineA.actions, machineB.actions, machineC.actions, machineD.actions)
      return { update$, actions }
    })
  }

  combine5(
    f: (a: Partial<A>, b: Partial<A>, c: Partial<A>, d: Partial<A>, e: Partial<A>) => Partial<A>,
    planB: PlanX<E, I, A>,
    planC: PlanX<E, I, A>,
    planD: PlanX<E, I, A>,
    planE: PlanX<E, I, A>
  ): PlanX<E, I, A> {
    return new PlanX<E, I, A>(intent$ => {
      let machineB = planB.apply(intent$),
        machineA = this.apply(intent$),
        machineC = planC.apply(intent$),
        machineD = planD.apply(intent$),
        machineE = planE.apply(intent$)
        ;
      let update$ = streamOps.combine<StateP<A>, StateP<A>, StateP<A>, StateP<A>, StateP<A>, StateP<A>>(
        (S1, S2, S3, S4, S5) =>
          S1.chain(s1 =>
            S2.chain(s2 =>
              S3.chain(s3 =>
                S4.chain(s4 =>
                  S5.chain(s5 =>
                    State.patch<A>(() => f(s1, s2, s3, s4, s5)))))))
        , machineA.update$, machineB.update$, machineC.update$, machineD.update$, machineE.update$
      )
      let actions = Object.assign({}, machineA.actions, machineB.actions, machineC.actions, machineD.actions, machineE.actions)
      return { update$, actions }
    })
  }

  concat(
    fa: PlanX<E, I, A>
  ): PlanX<E, I, A> {
    return new PlanX<E, I, A>(intent$ => {
      let machineA = this.apply(intent$)
      let machineB = fa.apply(intent$)
      let update$ = streamOps.merge<StateP<A>>(
        machineA.update$,
        machineB.update$
      )
      return { update$, actions: Object.assign({}, machineA.actions, machineB.actions) }
    })
  }

  map(f: (a: Partial<A>) => Partial<A>): PlanX<E, I, A> {
    return new PlanX<E, I, A>(intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<StateP<A>, StateP<A>>(
        state => state.chain(() => State.patch<A>(f)),
        machine.update$
      )
      return { update$, actions: machine.actions }
    })
  }

  bimap(
    fa: (b?: Actions<I>) => Actions<I>, fb: (a: Partial<A>) => Partial<A>
  ): PlanX<E, I, A> {
    return new PlanX<E, I, A>(intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<StateP<A>, StateP<A>>(
        state => state.chain(() => State.patch<A>(fb)),
        machine.update$
      )
      return { update$, actions: fa(machine.actions) }
    })
  }

  toPlan(): Plan<E, I, A> {
    return intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<StateP<A>, Update<A>>(
        s => s.runS.bind(s),
        machine.update$
      )
      return { update$, actions: machine.actions }
    }
  }
}
