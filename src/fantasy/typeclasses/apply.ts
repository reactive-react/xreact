import { Functor } from './functor'
import { Cartesian } from './cartesian'
import { $, HKT, kind } from '.'

export interface Apply<F extends HKT> extends Cartesian<F>, Functor<F> {
  ap<A, B>(fab: $<F, (a: A) => B>, fa: $<F, A>): $<F, B>
}

export type ApplyInstances = keyof typeof Apply

export namespace Apply {
  const __name = "Apply"
}


export function ap<F extends ApplyInstances, A, B>(fab: $<F, (a: A) => B>, fa: $<F, A>): $<F, B> {
  let instance = (<any>Functor)[kind(fab)]
  return instance.ap(fab, fa) as $<F, B>
}

export function ap2<F extends ApplyInstances, A, B, C>(fabc: $<F, (a: A, b: B) => C>, fa: $<F, A>, fb: $<F, B>): $<F, C> {
  let instance: any = Apply[kind(fabc) as F]
  return instance.ap(
    instance.map(
      (f: (a: A, b: B) => C) => (([a, b]: [A, B]) => f(a, b))
      , fabc)
    , instance.product(fa, fb)
  ) as $<F, C>
}
