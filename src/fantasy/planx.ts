import { HKTS, streamOps } from '../xs'
import { State } from './state'
import { StateP, PlanS } from './interfaces'
import { Actions, Plan, Update } from '../interfaces'
export class PlanX<E extends HKTS, I, A> {
  apply: PlanS<E, I, A>
  constructor(plan: PlanS<E, I, A>) {
    this.apply = plan
  }

  combine(
    f: (a: Partial<A>, ub: Partial<A>) => Partial<A>,
    planB: PlanX<E, I, A>
  ): PlanX<E, I, A> {
    return new PlanX<E, I, A>(intent$ => {
      let machineB = planB.apply(intent$),
        machineA = this.apply(intent$)
      let update$ = streamOps.combine<StateP<A>, StateP<A>, StateP<A>>(
        (S1, S2) => {
          return S1.chain(s1 => {
            return S2.chain(s2 => {
              return State.pure(f(s1, s2))
            })
          })
        }, machineA.update$, machineB.update$
      )
      let actions = Object.assign({}, machineA.actions, machineB.actions)
      return { update$, actions }
    })
  }

  map(f: (a: Partial<A>) => Partial<A>): PlanX<E, I, A> {
    return new PlanX<E, I, A>(intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<StateP<A>, StateP<A>>(
        state => state.chain(s => State.pure(f(s))),
        machine.update$
      )
      return { update$, actions: machine.actions }
    })
  }

  bimap(
    fa: (a: Partial<A>) => Partial<A>, fb: (b?: Actions<I>) => Actions<I>
  ): PlanX<E, I, A> {
    return new PlanX<E, I, A>(intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<StateP<A>, StateP<A>>(
        state => state.chain(s => State.pure(fa(s))),
        machine.update$
      )
      return { update$, actions: fb(machine.actions) }
    })
  }

  toPlan(): Plan<E, I, A> {
    return intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<StateP<A>, Update<A>>(
        s => s.runA.bind(s),
        machine.update$
      )
      return { update$, actions: machine.actions }
    }
  }
}
