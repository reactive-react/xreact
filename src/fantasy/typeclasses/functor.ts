import { $, HKT, datatype, kind } from '.'
export interface Functor<F extends HKT> {
  map<A, B>(f: (a: A) => B, fa: $<F, A>): $<F, B>
}

export type FunctorInstances = keyof typeof Functor

export namespace Functor {
  export let Array = {
    map: <A, B>(f: (a: A) => B, fb: A[]) => fb.map(f)
  }
}

export function map<F extends FunctorInstances, A, B>(f: (a: A) => B, fa: $<F, A>): $<F, B> {
  let instance = Functor[kind<F>(fa)] as Functor<F>
  return instance.map(f, fa)
}
