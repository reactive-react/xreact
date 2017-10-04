import { Apply } from './apply'
import { $, HKT } from '.'

export interface FlatMap<F extends HKT> extends Apply<F> {
  flatMap<A, B>(f: (a: A) => $<F, B>, fb: $<F, A>): $<F, B>
}

export namespace FlatMap { }
