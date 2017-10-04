// import { Stream, streamOps } from '../xs'
// import { M_ } from '../xs'

// class StreamT<E extends Stream, F extends Applicative<M_<A>[E]>, A> {
//   stream: M_<A>[E]
//   constructor(v) {
//     this.stream = streamOps.just(v)
//   }
//   static pure<F, A>(value: A) {
//     return new StreamT(value)
//   }

//   map<B>(f: (a: A) => B> {
//     this.stream = streamOps.map(f, this.stream)
//   }
//   value() {
//       return F.pure(this.stream)
//     }
// }
