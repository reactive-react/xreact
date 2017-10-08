import { Functor } from './functor'
import { Cartesian } from './cartesian'
import { $, HKT } from '.'

export interface Apply<F extends HKT> extends Cartesian<F>, Functor<F> {
  ap<A, B>(fab: $<F, (a: A) => B>, fa: $<F, A>): $<F, B>
}

export namespace Apply { 
  const __name = "Apply"
}
