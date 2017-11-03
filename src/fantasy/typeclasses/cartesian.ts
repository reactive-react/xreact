import { $, HKT, kind } from '.'

export type CartesianInstances = keyof typeof Cartesian
export interface Cartesian<F extends HKT> {
  product<A, B>(fa: $<F, A>, fb: $<F, B>): $<F, [A, B]>
}

export namespace Cartesian {
  const __name = "Cartesian"
}

export function product<F extends CartesianInstances, A, B>(fa: $<F, A>, fb: $<F, B>): $<F, [A, B]> {
  let instance = Cartesian[kind<F>(fa)] as Cartesian<F>
  return instance.product<A, B>(fa, fb)
}
