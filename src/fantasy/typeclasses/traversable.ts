import { $, HKT, kind } from '.'
import { Functor, map } from './functor'
import { ApplicativeInstances, Applicative, lift2 } from './applicative'

export interface Traversable<T extends HKT> extends Functor<T> {
  traverse<F extends ApplicativeInstances, A, B>(f: (a: A) => $<F, B>, ta: $<T, A>): $<F, $<T, B>>
}

export type TraversableInstances = keyof typeof Traversable

export class TraversableArray {
  traverse<F extends ApplicativeInstances, A, B>(name: F): (f: (a: A, index?: number) => $<F, B>, ta: A[]) => $<F, B[]> {
    return (f: (a: A, index?: number) => $<F, B>, ta: A[]): $<F, B[]> => {
      let instance = <any>Applicative[name]
      return ta.reduce<$<F, B[]>>(
        (acc, i, index) => lift2<F, B[], B[], B[]>((a: B[], b: B[]) => a.concat(b))(
          acc
          , map<F, B, B[]>(a => [a], f(i, index)))
        , instance.pure([]) as $<F, B[]>
      )
    }
  }
}

export namespace Traversable {
  export let Array = new TraversableArray
}
