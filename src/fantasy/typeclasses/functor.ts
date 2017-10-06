import { $, HKT, datatype, kind } from '.'
export interface Functor<F extends HKT> {
  map<A, B>(f: (a: A) => B, fa: $<F, A>): $<F, B>
}

export type FunctorInstances = keyof typeof Functor

declare module '.' {
  export interface _<A> {
    "Array": Array<A>
  }
}

export namespace Functor {
  export let Array = {
    map: <A, B>(f: (a: A) => B, fb: A[]) => fb.map(f)
  }
}

export function map<F extends FunctorInstances, A, B>(f: (a: A) => B, fa: $<F, A>): $<F, B> {
  let instance = (<any>Functor)[kind(fa)]
  return instance.map(f, fa) as $<F, B>
}
