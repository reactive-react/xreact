import { Apply } from './apply'
import { $, HKT, kind } from '.'

export interface FlatMap<F extends HKT> extends Apply<F> {
  flatMap<A, B>(f: (a: A) => $<F, B>, fb: $<F, A>): $<F, B>
}
export type FlatMapInstances = keyof typeof FlatMap
export namespace FlatMap { 
  const __name = "FlatMap"
}

export function flatMap<F extends FlatMapInstances, A, B>(f: (a: A) => $<F, B>, fa: $<F, A>): $<F, B> {
  return (<any>FlatMap)[kind(fa)].flatMap(f, fa) as $<F, B>
}
