import { Stream, streamOps } from '../xs'
import { $ } from './typeclasses'
import { FunctorInstances, map } from './typeclasses/functor'


class StreamT<F extends FunctorInstances, A> {
  value: $<F, $<Stream, A>>
  constructor(v: $<F, $<Stream, A>>) {
    this.value = v
  }
  map<B>(f: (a: A) => B): StreamT<F, B> {
    return new StreamT(
      map((s: $<Stream, A>) => streamOps.map(f, s), this.value)
    )
  }
}
