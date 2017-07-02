import { HKTS } from '../xs'
import { PlanX } from './planx'
import { PlanS } from './interfaces'
import { x } from '../x'
import { Actions, XcomponentClass } from '../interfaces'
export class FantasyX<E extends HKTS, I, S> {
  plan: PlanX<E, I, S>
  constructor(plan: PlanS<E, I, S>) {
    this.plan = new PlanX(plan)
  }
  apply(WrappedComponent) {
    return x(this.plan.toPlan())(WrappedComponent)
  }
  map(f: (s: Partial<S>) => Partial<S>): FantasyX<E, I, S> {
    return new FantasyX(this.plan.map(f).apply)
  }

  combine(
    f: (s1: Partial<S>, s2: Partial<S>) => Partial<S>,
    fb: FantasyX<E, I, S>
  ): FantasyX<E, I, S> {
    return new FantasyX(this.plan.combine(f, fb.plan).apply)
  }

  concat(fb: FantasyX<E, I, S>): FantasyX<E, I, S> {
    return new FantasyX(this.plan.concat(fb.plan).apply)
  }
  bimap(
    fa: (b?: Actions<I>) => Actions<I>, fb: (a: Partial<S>) => Partial<S>
  ): FantasyX<E, I, S> {
    return new FantasyX(this.plan.bimap(fa, fb).apply)
  }
}
