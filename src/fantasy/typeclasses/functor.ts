import { $, HKT } from '.'


export interface Functor<F extends HKT> {
  map<A, B>(f: (a: A) => B, fa: $<F, A>): $<F, B>
}

export namespace Functor { }
