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

  combine3(
    f: (s1: Partial<S>, s2: Partial<S>, s3: Partial<S>) => Partial<S>,
    fb: FantasyX<E, I, S>,
    fc: FantasyX<E, I, S>
  ): FantasyX<E, I, S> {
    return new FantasyX(this.plan.combine3(f, fb.plan, fc.plan).apply)
  }

  combine4(
    f: (s1: Partial<S>, s2: Partial<S>, s3: Partial<S>, s4: Partial<S>) => Partial<S>,
    fb: FantasyX<E, I, S>,
    fc: FantasyX<E, I, S>,
    fd: FantasyX<E, I, S>
  ): FantasyX<E, I, S> {
    return new FantasyX(this.plan.combine4(f, fb.plan, fc.plan, fd.plan).apply)
  }

  combine5(
    f: (s1: Partial<S>, s2: Partial<S>, s3: Partial<S>, s4: Partial<S>, s5: Partial<S>) => Partial<S>,
    fb: FantasyX<E, I, S>,
    fc: FantasyX<E, I, S>,
    fd: FantasyX<E, I, S>,
    fe: FantasyX<E, I, S>
  ): FantasyX<E, I, S> {
    return new FantasyX(this.plan.combine5(f, fb.plan, fc.plan, fd.plan, fe.plan).apply)
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
