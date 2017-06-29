import { HKTS, Subject, HKT, streamOps } from './xs'
import { Plan, Actions, Xcomponent, XcomponentClass, Engine, Update, XProps, ContextEngine, XREACT_ENGINE } from './interfaces'
import { XOrReactComponent, x } from './x'
import { extendXComponentClass, genXComponentClass } from './xclass'

export type Partial<T> = {
  [P in keyof T]?: T[P];
}

export interface pair<S, A> {
  s: S
  a: A
}

export class State<S, A> {
  runState: (s: S) => pair<S, A>
  constructor(runState: (s: S) => pair<S, A>) {
    this.runState = runState
  }
  static pure<A>(a: A) {
    return new State((s: any) => ({ s: s, a: a }))
  }

  chain<B>(f: (a: A) => State<S, B>): State<S, B> {
    return new State((state: S) => {
      let { a, s } = this.runState(state)
      return f(a).runState(s)
    })
  }

  runA(state: S): A {
    return this.runState(state).a
  }

  runS(state: S): S {
    return this.runState(state).s
  }

  static get<S>(): State<S, S> {
    return new State((s: S) => ({ s: s, a: s }))
  }

  static put<S>(s: S): State<S, void> {
    return new State((_: S) => ({ a: undefined, s: s }))
  }

  static modify<S>(f: (s: S) => S): State<S, void> {
    return new State((s: S) => ({ a: undefined, s: f(s) }))
  }

  static patch<S>(f: (s: S) => Partial<S>): State<S, Partial<S>> {
    return new State((s: S) => {
      let p = f(s)
      return {
        a: p, s: Object.assign({}, s, p)
      }
    })
  }
}

export type StateP<S> = State<S, Partial<S>>

export interface Machine<E extends HKTS, I, S> {
  actions?: Actions<I>
  update$: HKT<StateP<S>>[E]
}
export class PlanX<E extends HKTS, I, A> {
  apply: PlanS<E, I, A>
  constructor(plan: PlanS<E, I, A>) {
    this.apply = plan
  }

  combine(
    f: (a: Partial<A>, ub: Partial<A>) => Partial<A>,
    planB: PlanX<E, I, A>
  ): PlanX<E, I, A> {
    return new PlanX<E, I, A>(intent$ => {
      let machineB = planB.apply(intent$),
        machineA = this.apply(intent$)
      let update$ = streamOps.combine<StateP<A>, StateP<A>, StateP<A>>(
        (S1, S2) => {
          return S1.chain(s1 => {
            return S2.chain(s2 => {
              return State.pure(f(s1, s2))
            })
          })
        }, machineA.update$, machineB.update$
      )
      let actions = Object.assign({}, machineA.actions, machineB.actions)
      return { update$, actions }
    })
  }

  map<B>(f: (a: Partial<A>) => Partial<A>): PlanX<E, I, A> {
    return new PlanX<E, I, A>(intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<StateP<A>, StateP<A>>(
        state => state.chain(s => State.pure(f(s))),
        machine.update$
      )
      return { update$, actions: machine.actions }
    })
  }

  toPlan(): Plan<E, I, A> {
    return intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<StateP<A>, Update<A>>(
        s => s.runA.bind(s),
        machine.update$
      )
      return { update$, actions: machine.actions }
    }
  }

  // bimap<B>(
  //   fu: (a: StateP<A>) => StateP<B>,
  //   fa: (a: Actions<I>) => Actions<I>
  // ): PlanX<E, I, B> {
  //   return new PlanX<E, I, B>(intent$ => {
  //     let machine = this.apply(intent$)
  //     let update$ = streamOps.map<StateP<A>, StateP<B>>(
  //       update => fu(update),
  //       machine.update$
  //     )
  //     return { update$, actions: machine.actions ? fa(machine.actions) : {} }
  //   })
  // }
}

export class FantasyX<E extends HKTS, I, S> {
  plan: PlanX<E, I, S>
  constructor(plan: PlanS<E, I, S>) {
    this.plan = new PlanX(plan)
  }
  apply(WrappedComponent) {
    return x(this.plan.toPlan())(WrappedComponent)
  }
  map(f: (s: Partial<S>) => Partial<S>): FantasyX<E, I, S> {
    return new FantasyX(this.plan.map(f).apply)
  }
}

export type PlanS<E extends HKTS, I, S> = (i: Subject<E, I>) => Machine<E, I, S>

export function pure<E extends HKTS, I, S>(plan: Plan<E, I, S>): FantasyX<E, I, S> {
  return new FantasyX<E, I, S>(intent$ => {
    let { update$, actions } = plan(intent$)
    return {
      actions,
      update$: streamOps.map<Update<Partial<S>>, StateP<S>>(
        f => State.patch<S>(f), update$
      )
    }
  })
}

export function map<E extends HKTS, I, A>(
  f: (s: Partial<A>) => Partial<A>, fa: FantasyX<E, I, A>
): FantasyX<E, I, A> {
  return fa.map(f)
}

export function lift<E extends HKTS, I, A>(
  f: (s: Partial<A>) => Partial<A>
): (fa: FantasyX<E, I, A>) => FantasyX<E, I, A> {
  return fa => fa.map(f)
}

export function lift2<E extends HKTS, I, A>(
  f: (s1: Partial<A>, s2: Partial<A>) => Partial<A>
): (fa1: FantasyX<E, I, A>, fa2: FantasyX<E, I, A>) => FantasyX<E, I, A> {
  return (fa1, fa2) => new FantasyX(fa1.plan.combine(f, fa2.plan).apply)
}
