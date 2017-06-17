import { HKTS, HKT, streamOps } from './xs'
import { Plan, Xcomponent, XcomponentClass, Engine, Update, XProps, ContextEngine, XREACT_ENGINE } from './interfaces'
import { XOrReactComponent, x } from './x'
import { extendXComponentClass, genXComponentClass } from './xclass'

export class PlanX<E extends HKTS, I, A> {
  apply: Plan<E, I, A>
  constructor(plan: Plan<E, I, A>) {
    this.apply = plan
  }

  static empty<F extends HKTS, A>() {
    return new PlanX(intent$ => ({
      update$: streamOps.empty() as HKT<Update<A>>[F],
      actions: {}
    }))
  }

  concat(planB: PlanX<E, I, A>): Plan<E, I, A> {
    return intent$ => {
      let machineB = planB.apply(intent$), machineA = this.apply(intent$)
      let update$ = streamOps.merge<Update<A>>(machineA.update$, machineB.update$)
      let actions = Object.assign({}, machineA.actions, machineB.actions)
      return { update$, actions }
    }
  }

  map<B>(f: (a: Update<A>) => Update<B>): PlanX<E, I, B> {
    return new PlanX<E, I, B>(intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<Update<A>, Update<B>>(
        update => f(update),
        machine.update$
      )
      return { update$, actions: machine.actions }
    })
  }
}

export class FantasyX<E extends HKTS, I, S> {
  plan: PlanX<E, I, S>
  constructor(plan: Plan<E, I, S>) {
    this.plan = new PlanX(plan)
  }
  apply(WrappedComponent) {
    return x(this.plan.apply)(WrappedComponent)
  }
  map<A>(f: (plan: PlanX<E, I, S>) => PlanX<E, I, A>): FantasyX<E, I, A> {
    return new FantasyX(f(this.plan).apply)
  }
  chain<A>(f: (plan: PlanX<E, I, S>) => FantasyX<E, I, A>): FantasyX<E, I, A> {
    return f(this.plan)
  }
}

export function pure<E extends HKTS, I, S>(plan: Plan<E, I, S>): FantasyX<E, I, S> {
  return new FantasyX(plan)
}
export function map<E extends HKTS, I, A, B>(
  f: (plan: PlanX<E, I, A>) => PlanX<E, I, B>, fa: FantasyX<E, I, A>
): FantasyX<E, I, B> {
  return fa.map(f)
}

export function lift<E extends HKTS, I, A, B>(
  f: (plan: PlanX<E, I, A>) => PlanX<E, I, B>
): (fa: FantasyX<E, I, A>) => FantasyX<E, I, B> {
  return fa => fa.map(f)
}

export function lift2<E extends HKTS, I, A, B, C>(
  f: (plan1: PlanX<E, I, A>, plan2: PlanX<E, I, B>) => PlanX<E, I, C>
): (fa1: FantasyX<E, I, A>, fa2: FantasyX<E, I, B>) => FantasyX<E, I, C> {
  return (fa1, fa2) => new FantasyX(f(fa1.plan, fa2.plan).apply)
}
