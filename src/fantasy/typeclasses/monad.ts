import { Apply } from './apply'
import { FlatMap } from './flatmap'
import { $, HKT } from '.'

export type MonadInstances = keyof typeof Monad

export interface Monad<F extends HKT> extends FlatMap<F>, Apply<F> { }

export namespace Monad {
    const __name = "Monad"
 }
