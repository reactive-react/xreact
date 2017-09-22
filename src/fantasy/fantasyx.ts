import { Stream } from '../xs'
import { PlanX } from './planx'
import { PlanS } from './interfaces'
import { x } from '../x'
import { Actions, XcomponentClass } from '../interfaces'
export class FantasyX<E extends Stream, I, S, A> {
  plan: PlanX<E, I, S, A>
  constructor(plan: PlanS<E, I, S, A>) {
    this.plan = new PlanX(plan)
  }
  apply(WrappedComponent) {
    return x(this.plan.patch().toPlan())(WrappedComponent)
  }
  map<B>(f: (a: A) => B): FantasyX<E, I, S, B> {
    return new FantasyX(this.plan.map(f).apply)
  }

  fold<B>(f: (acc: B, i: A) => B, base): FantasyX<E, I, S, B> {
    return new FantasyX(this.plan.fold(f, base).apply)
  }

  combine<B, C>(
    f: (s1: A, s2: B) => C,
    fb: FantasyX<E, I, S, B>
  ): FantasyX<E, I, S, C> {
    return new FantasyX(this.plan.combine(f, fb.plan).apply)
  }

  combine3<B, C, D>(
    f: (s1: A, s2: B, s3: C) => D,
    fb: FantasyX<E, I, S, B>,
    fc: FantasyX<E, I, S, C>
  ): FantasyX<E, I, S, D> {
    return new FantasyX(this.plan.combine3(f, fb.plan, fc.plan).apply)
  }

  combine4<B, C, D, F>(
    f: (s1: A, s2: B, s3: C, s4: D) => F,
    fb: FantasyX<E, I, S, B>,
    fc: FantasyX<E, I, S, C>,
    fd: FantasyX<E, I, S, D>
  ): FantasyX<E, I, S, F> {
    return new FantasyX(this.plan.combine4(f, fb.plan, fc.plan, fd.plan).apply)
  }

  combine5<B, C, D, F, G>(
    f: (s1: A, s2: B, s3: C, s4: D, s5: F) => G,
    fb: FantasyX<E, I, S, B>,
    fc: FantasyX<E, I, S, C>,
    fd: FantasyX<E, I, S, D>,
    fe: FantasyX<E, I, S, F>
  ): FantasyX<E, I, S, G> {
    return new FantasyX(this.plan.combine5(f, fb.plan, fc.plan, fd.plan, fe.plan).apply)
  }

  concat(fb: FantasyX<E, I, S, A>): FantasyX<E, I, S, A> {
    return new FantasyX(this.plan.concat(fb.plan).apply)
  }

  merge<B>(fb: FantasyX<E, I, S, A | B>): FantasyX<E, I, S, A | B> {
    return new FantasyX(this.plan.merge(fb.plan).apply)
  }

  bimap<B>(
    fa: (b?: Actions<I>) => Actions<I>, fb: (a: A) => B
  ): FantasyX<E, I, S, B> {
    return new FantasyX(this.plan.bimap(fa, fb).apply)
  }
}
