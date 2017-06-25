import { HKTS, HKT, streamOps } from './xs'
import { Plan, Actions, Xcomponent, XcomponentClass, Engine, Update, XProps, ContextEngine, XREACT_ENGINE } from './interfaces'
import { XOrReactComponent, x } from './x'
import { extendXComponentClass, genXComponentClass } from './xclass'

export class PlanX<E extends HKTS, I, A> {
  apply: Plan<E, I, A>
  constructor(plan: Plan<E, I, A>) {
    this.apply = plan
  }

  static empty<F extends HKTS, I, A>() {
    return new PlanX<F, I, A>(intent$ => ({
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

  combine<B, C>(
    f: (ua: Update<A>, ub: Update<B>) => Update<C>,
    planB: PlanX<E, I, B>
  ): PlanX<E, I, C> {
    return new PlanX<E, I, C>(intent$ => {
      let machineB = planB.apply(intent$),
        machineA = this.apply(intent$)
      let update$ = streamOps.combine<Update<A>, Update<B>, Update<C>>(
        f, machineA.update$, machineB.update$
      )
      let actions = Object.assign({}, machineA.actions, machineB.actions)
      return { update$, actions }
    })
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

  bimap<B>(
    fu: (a: Update<A>) => Update<B>,
    fa: (a: Actions<I>) => Actions<I>
  ): PlanX<E, I, B> {
    return new PlanX<E, I, B>(intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<Update<A>, Update<B>>(
        update => fu(update),
        machine.update$
      )
      return { update$, actions: fa(machine.actions) }
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

export function overUpdate<E extends HKTS, I, A, B>(
  f: (update: Update<A>) => Update<B>,
  fa: FantasyX<E, I, A>
): FantasyX<E, I, B> {
  return fa.map(plan => plan.map(f))
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

export function liftCombine<E extends HKTS, I, A, B, C>(
  f: (ua: Update<A>, ub: Update<B>) => Update<C>
): (fa1: FantasyX<E, I, A>, fa2: FantasyX<E, I, B>) => FantasyX<E, I, C> {
  return lift2<E, I, A, B, C>((p1, p2) => p1.combine(f, p2))
}
