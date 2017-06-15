import { HKTS } from './xs'
import { Plan, Xcomponent, XcomponentClass, Engine, XProps, ContextEngine, XREACT_ENGINE } from './interfaces'
import { XOrReactComponent, x } from './x'
import { extendXComponentClass, genXComponentClass } from './xclass'
export class FantasyX<E extends HKTS, I, S> {
  plan: Plan<E, I, S>
  constructor(plan: Plan<E, I, S>) {
    this.plan = plan
  }
  apply(WrappedComponent) {
    return x(this.plan)(WrappedComponent)
  }
  map<A>(f: (plan: Plan<E, I, S>) => Plan<E, I, A>): FantasyX<E, I, A> {
    return new FantasyX(f(this.plan))
  }
  chain<A>(f: (plan: Plan<E, I, S>) => FantasyX<E, I, A>): FantasyX<E, I, A> {
    return f(this.plan)
  }
}

export function pure<E extends HKTS, I, S>(plan: Plan<E, I, S>): FantasyX<E, I, S> {
  return new FantasyX(plan)
}
export function map<E extends HKTS, I, A, B>(f: (plan: Plan<E, I, A>) => Plan<E, I, B>, fa: FantasyX<E, I, A>): FantasyX<E, I, B> {
  return fa.map(f)
}

export function lift<E extends HKTS, I, A, B>(f: (plan: Plan<E, I, A>) => Plan<E, I, B>): (fa: FantasyX<E, I, A>) => FantasyX<E, I, B> {
  return fa => fa.map(f)
}

export function lift2<E extends HKTS, I, A, B, C>(f: (plan1: Plan<E, I, A>, plan2: Plan<E, I, B>) => Plan<E, I, C>): (fa1: FantasyX<E, I, A>, fa2: FantasyX<E, I, B>) => FantasyX<E, I, C> {
  return (fa1, fa2) => new FantasyX(f(fa1.plan, fa2.plan))
}
