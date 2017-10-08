import { pair, Partial } from './interfaces'
import { Functor } from './typeclasses/functor'
import { Cartesian } from './typeclasses/cartesian'
import { Apply } from './typeclasses/apply'
import { FlatMap } from './typeclasses/flatmap'
import { Applicative } from './typeclasses/applicative'
import { Semigroup, concat } from './typeclasses/semigroup'
import { Monad, MonadInstances } from './typeclasses/monad'
import { datatype } from './typeclasses'

export const kind = "State"
export type kind = typeof kind

declare module './typeclasses' {
  interface _<A> {
    'State': State<any, A>
  }
}

@datatype(kind)
export class State<S, A> {
  _S: S
  _A: A
  runState: (s: S) => pair<S, A>
  constructor(runState: (s: S) => pair<S, A>) {
    this.runState = runState
  }

  runA(state: S): A {
    return this.runState(state).a
  }

  runS(state: S): S {
    return this.runState(state).s
  }

  static pure<S, A>(a: A): State<S, A> {
    return new State((s: S) => ({ a, s }))
  }

  static get<S>(): State<S, S> {
    return new State((s: S) => ({ s: s, a: s }))
  }

  static put<S>(s: S): State<S, void> {
    return new State((_: S) => ({ a: undefined, s: s }))
  }

  static modify<S>(f: (s: S) => Partial<S>): State<S, void> {
    return new State((s: S) => ({ a: undefined, s: Object.assign({}, s, f(s)) }))
  }

  patch(f: (a: A, s?: S) => Partial<S>): State<S, void> {
    return new State((state: S) => {
      let { a, s } = this.runState(state)
      return {
        a: undefined, s: Object.assign({}, s, f(a, s))
      }
    })
  }
}

export class StateFunctor implements Functor<kind> {
  map<A, B, C>(f: (a: A) => B, fa: State<C, A>): State<C, B> {
    return new State((state: C) => {
      let { a, s } = fa.runState(state)
      return { a: f(a), s: s }
    })
  }
}

declare module './typeclasses/functor' {
  namespace Functor {
    let State: StateFunctor
  }
}

Functor.State = new StateFunctor

export class StateCartesian implements Cartesian<kind> {
  product<A, B, S>(fa: State<S, A>, fb: State<S, B>): State<S, [A, B]> {
    return new State((state: S) => {
      let { a: a1, s: s1 } = fa.runState(state)
      let { a: a2, s: s2 } = fb.runState(s1)
      return { a: [a1, a2] as [A, B], s: s2 }
    })
  }
}

declare module './typeclasses/cartesian' {
  namespace Cartesian {
    let State: StateCartesian
  }
}

Cartesian.State = new StateCartesian

export class StateApply implements Apply<kind> {
  ap<A, B, S>(fab: State<S, (a: A) => B>, fa: State<S, A>): State<S, B> {
    return new State((state: S) => {
      let { a: f, s: s1 } = fab.runState(state)
      let { a, s: s2 } = fa.runState(s1)
      return { a: f(a), s: s2 }
    })
  }
  map = Functor.State.map
  product = Cartesian.State.product
}

declare module './typeclasses/apply' {
  namespace Apply {
    let State: StateApply
  }
}
Apply.State = new StateApply

export class StateApplicative extends StateApply implements Applicative<kind> {
  pure = State.pure
}

declare module './typeclasses/applicative' {
  namespace Applicative {
    let State: StateApplicative
  }
}
Applicative.State = new StateApplicative

export class StateFlatMap extends StateApplicative implements FlatMap<kind> {
  flatMap<A, B, S>(f: (a: A) => State<S, B>, fa: State<S, A>): State<S, B> {
    return new State((state: S) => {
      let { a, s } = fa.runState(state)
      return f(a).runState(s)
    })
  }
}

declare module './typeclasses/flatmap' {
  namespace FlatMap {
    let State: StateFlatMap
  }
}

FlatMap.State = new StateFlatMap

export class StateMonad extends StateApplicative implements Monad<kind> {
  flatMap = FlatMap.State.flatMap
}

declare module './typeclasses/monad' {
  namespace Monad {
    let State: StateMonad
  }
}

Monad.State = new StateMonad
