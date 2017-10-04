import { Apply } from './apply'
import { $, HKT } from '.'

export interface Applicative<F extends HKT> extends Apply<F> {
  pure<A>(v: A): $<F, A>
}

export namespace Applicative { }
