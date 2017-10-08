import { Apply } from './apply'
import { $, HKT } from '.'

export type ApplicativeInstances = keyof typeof Applicative
export interface Applicative<F extends HKT> extends Apply<F> {
  pure<A>(v: A): $<F, A>
}
export namespace Applicative {
  const __name = "Applicative"
}