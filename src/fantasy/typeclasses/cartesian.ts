import { $, HKT } from '.'

export interface Cartesian<F extends HKT> {
  product<A, B>(fa: $<F, A>, fb: $<F, B>): $<F, [A, B]>
}

export namespace Cartesian { }
