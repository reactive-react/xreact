import { Apply, ap2 } from './apply'
import { $, HKT, kind } from '.'

export type ApplicativeInstances = keyof typeof Applicative
export interface Applicative<F extends HKT> extends Apply<F> {
  pure<A>(v: A): $<F, A>
}
export namespace Applicative {
  const __name = "Applicative"
}

export function lift2<F extends ApplicativeInstances, A, B, C>(fabc: (a: A, b: B) => C): (fa: $<F, A>, fb: $<F, B>) => $<F, C> {
  return function(fa: $<F, A>, fb: $<F, B>): $<F, C> {
    let instance = Applicative[kind<F>(fa)] as Applicative<F>
    return ap2<F, A, B, C>(instance.pure(fabc), fa, fb)
  }
}
