import { Apply } from './apply'
import { FlatMap } from './flatmap'
import { $, HKT } from '.'

export interface Monad<F extends HKT> extends FlatMap<F>, Apply<F> { }

export namespace Monad { }
