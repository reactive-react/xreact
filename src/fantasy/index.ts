export { Xstream } from './xstream'
export { FantasyX } from './fantasyx'
export * from './typeclasses/applicative'
export * from './typeclasses/functor'
export * from './typeclasses/apply'
export * from './typeclasses/monad'
export * from './typeclasses/flatmap'
export * from './typeclasses/cartesian'
export * from './typeclasses/semigroup'
export * from './typeclasses/traversable'
// export function fromPlan<E extends Stream, I, S>(plan: Plan<E, I, S>): FantasyX<E, I, S, void> {
//   return new FantasyX<E, I, S, void>((intent$: Subject<E, I>) => {
//     let { update$, actions } = plan(intent$)
//     return {
//       actions,
//       update$: streamOps.map<Update<S>, State<S, void>>(
//         f => State.modify<S>(f), update$
//       )
//     }
//   })
// }

// export function fromEvent<E extends Stream, I extends Event, S>(
//   type: string, name: string, defaultVal?: string
// ): FantasyX<E, I, S, string> {
//   return new FantasyX<E, I, S, string>(intent$ => {
//     return {
//       update$: streamOps.merge<State<S, string>>(
//         typeof defaultVal != 'undefined' ? streamOps.just<State<S, string>>(State.pure<S, string>(defaultVal)) : streamOps.empty<State<S, string>>(),
//         streamOps.map<Event, State<S, string>>(
//           e => State.pure<S, string>((e.target as HTMLFormElement).value),
//           streamOps.filter<I>(i => {
//             let target = i.target as HTMLFormElement
//             return target.tagName == 'INPUT' && target.name == name
//           }, (intent$ as _<I>[E])))
//       )
//     }
//   })
// }

// export function pure<E extends Stream, I, S, A>(a: A) {
//   return new FantasyX<E, I, S, A>(intent$ => {
//     return {
//       update$: streamOps.just<State<S, A>>(State.pure<S, A>(a))
//     }
//   })
// }

// export function ap<E extends Stream, I, S, A, B>(
//   ff: FantasyX<E, I, S, (a: A) => B>,
//   fa: FantasyX<E, I, S, A>
// ): FantasyX<E, I, S, B> {
//   return ff.combine((f, a) => f(a), fa)
// }

// export function empty<E extends Stream, I, S, A>() {
//   return new FantasyX<E, I, S, A>(intent$ => {
//     return {
//       update$: streamOps.empty<State<S, A>>()
//     }
//   })
// }

// export function map<E extends Stream, I, S, A, B>(
//   f: (s: A) => B, fa: FantasyX<E, I, S, A>
// ): FantasyX<E, I, S, B> {
//   return fa.map(f)
// }


// export function traverse<E extends Stream, I, S, A>(
//   f: (a: A, index?: number) => FantasyX<E, I, S, A>, xs: A[]
// ): FantasyX<E, I, S, A[]> {
//   return xs.reduce((acc, i, index) => acc.concat(f(i, index).map(x => [x])), pure<E, I, S, A[]>([]))
// }

// export function fold<E extends Stream, I, S, A, B>(
//   f: (acc: B, i: A) => B, base: B, fa: FantasyX<E, I, S, A>
// ): FantasyX<E, I, S, B> {
//   return fa.fold(f, base)
// }

// export function lift<E extends Stream, I, S, A, B>(
//   f: (s: A) => B
// ): (fa: FantasyX<E, I, S, A>) => FantasyX<E, I, S, B> {
//   return fa => fa.map(f)
// }

// export function lift2<E extends Stream, I, S, A, B, C>(
//   f: (a: A, b: B) => C
// ): (fa1: FantasyX<E, I, S, A>, fa2: FantasyX<E, I, S, B>) => FantasyX<E, I, S, C> {
//   return (fa1, fa2) => fa1.combine(f, fa2)
// }

// export function lift3<E extends Stream, I, S, A, B, C, D>(
//   f: (a: A, b: B, c: C) => D
// ): (fa1: FantasyX<E, I, S, A>, fa2: FantasyX<E, I, S, B>, fa3: FantasyX<E, I, S, C>) => FantasyX<E, I, S, D> {
//   return (fa1, fa2, fa3) => fa1.combine3(f, fa2, fa3)
// }

// export function lift4<E extends Stream, I, S, A, B, C, D, F>(
//   f: (a: A, b: B, c: C, d: D) => F
// ): (fa1: FantasyX<E, I, S, A>, fa2: FantasyX<E, I, S, B>, fa3: FantasyX<E, I, S, C>, fa4: FantasyX<E, I, S, D>) => FantasyX<E, I, S, F> {
//   return (fa1, fa2, fa3, fa4) => fa1.combine4(f, fa2, fa3, fa4)
// }

// export function lift5<E extends Stream, I, S, A, B, C, D, F, G>(
//   f: (
//     s1: A,
//     s2: B,
//     s3: C,
//     s4: D,
//     s5: F
//   ) => G
// ): (
//     fa1: FantasyX<E, I, S, A>,
//     fa2: FantasyX<E, I, S, B>,
//     fa3: FantasyX<E, I, S, C>,
//     fa4: FantasyX<E, I, S, D>,
//     fa5: FantasyX<E, I, S, F>
//   ) => FantasyX<E, I, S, G> {
//   return (fa1, fa2, fa3, fa4, fa5) => fa1.combine5(f, fa2, fa3, fa4, fa5)
// }

// export function concat<E extends Stream, I, S, A>(
//   fa: FantasyX<E, I, S, A>,
//   fb: FantasyX<E, I, S, A>
// ): FantasyX<E, I, S, A> {
//   return fa.concat(fb)
// }

// export function merge<E extends Stream, I, S, A, B>(
//   fa: FantasyX<E, I, S, A>,
//   fb: FantasyX<E, I, S, B>
// ): FantasyX<E, I, S, A | B> {
//   return fa.merge(fb)
// }
