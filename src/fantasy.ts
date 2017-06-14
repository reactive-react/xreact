import { HKTS } from './xs'
import { Plan, Xcomponent, XcomponentClass, Engine, XProps, ContextEngine, XREACT_ENGINE } from './interfaces'
import { isXcomponentClass, XOrReactComponent, x } from './x'
import { extendXComponentClass, genXComponentClass } from './xclass'
export class FantasyX<E extends HKTS, I, S> {
  plan: Plan<E, I, S>
  x: (WrappedComponent: XOrReactComponent<E, I, S>) => XcomponentClass<E, I, S>
  constructor(plan: Plan<E, I, S>) {
    this.plan = plan
  }
  apply(WrappedComponent) {
    return x(this.plan)(WrappedComponent)
  }
  map<B>(f: (plan: Plan<E, I, S>) => Plan<E, I, B>) {
    return new FantasyX(f(this.plan))
  }
}

export function pure<E extends HKTS, I, S>(plan: Plan<E, I, S>): FantasyX<E, I, S> {
  return new FantasyX(plan)
}
export function map<E extends HKTS, I, A, B>(f: (plan: Plan<E, I, A>) => Plan<E, I, B>, fa: FantasyX<E, I, A>): FantasyX<E, I, B> {
  return fa.map(f)
}
