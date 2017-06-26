import { HKTS, Subject, HKT, streamOps } from './xs'
import { Plan as Plan0, Actions, Xcomponent, XcomponentClass, Engine, Update, XProps, ContextEngine, XREACT_ENGINE } from './interfaces'
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
  static pure<S, A>(a: A) {
    return new State((s: S) => ({ s: s, a: a }))
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

  static put<S>(s: S): State<S, {}> {
    return new State((_: S) => ({ a: null, s: s }))
  }

  static modify<S>(f: (s: S) => S): State<S, {}> {
    return new State((s: S) => ({ a: null, s: f(s) }))
  }
}

export type StateP<S> = State<S, Partial<S>>

export interface Machine<E extends HKTS, I, S> {
  actions?: Actions<I>
  update$: HKT<StateP<S>>[E]
}
export class PlanX<E extends HKTS, I, A> {
  apply: Plan<E, I, A>
  constructor(plan: Plan<E, I, A>) {
    this.apply = plan
  }

  static empty<F extends HKTS, I, A>() {
    return new PlanX<F, I, A>(intent$ => ({
      update$: streamOps.empty() as HKT<StateP<A>>[F],
      actions: {}
    }))
  }

  concat(planB: PlanX<E, I, A>): Plan<E, I, A> {
    return intent$ => {
      let machineB = planB.apply(intent$), machineA = this.apply(intent$)
      let update$ = streamOps.merge<StateP<A>>(machineA.update$, machineB.update$)
      let actions = Object.assign({}, machineA.actions, machineB.actions)
      return { update$, actions }
    }
  }

  combine<B, C>(
    f: (ua: StateP<A>, ub: StateP<B>) => StateP<C>,
    planB: PlanX<E, I, B>
  ): PlanX<E, I, C> {
    return new PlanX<E, I, C>(intent$ => {
      let machineB = planB.apply(intent$),
        machineA = this.apply(intent$)
      let update$ = streamOps.combine<StateP<A>, StateP<B>, StateP<C>>(
        f, machineA.update$, machineB.update$
      )
      let actions = Object.assign({}, machineA.actions, machineB.actions)
      return { update$, actions }
    })
  }

  map<B>(f: (a: StateP<A>) => StateP<B>): PlanX<E, I, B> {
    return new PlanX<E, I, B>(intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<StateP<A>, StateP<B>>(
        update => f(update),
        machine.update$
      )
      return { update$, actions: machine.actions }
    })
  }

  toPlan(): Plan0<E, I, A> {
    return intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<StateP<A>, Update<A>>(
        s => (state => s.runA(state)),
        machine.update$
      )
      return { update$, actions: machine.actions }
    }
  }

  bimap<B>(
    fu: (a: StateP<A>) => StateP<B>,
    fa: (a: Actions<I>) => Actions<I>
  ): PlanX<E, I, B> {
    return new PlanX<E, I, B>(intent$ => {
      let machine = this.apply(intent$)
      let update$ = streamOps.map<StateP<A>, StateP<B>>(
        update => fu(update),
        machine.update$
      )
      return { update$, actions: fa(machine.actions) }
    })
  }
}

export class FantasyX<E extends HKTS, I, S> {
  plan: PlanX<E, I, S>
  constructor(plan: Plan<E, I, S>) {
    this.plan = new PlanX(plan)
  }
  apply(WrappedComponent) {
    return x(this.plan.toPlan())(WrappedComponent)
  }
  map<A>(f: (plan: PlanX<E, I, S>) => PlanX<E, I, A>): FantasyX<E, I, A> {
    return new FantasyX(f(this.plan).apply)
  }
  chain<A>(f: (plan: PlanX<E, I, S>) => FantasyX<E, I, A>): FantasyX<E, I, A> {
    return f(this.plan)
  }
}
export type Plan<E extends HKTS, I, S> = (i: Subject<E, I>) => Machine<E, I, S>

export function pure<E extends HKTS, I, S>(f: Plan<E, I, S>): FantasyX<E, I, S> {
  return new FantasyX(f)
}

export function map<E extends HKTS, I, A, B>(
  f: (plan: PlanX<E, I, A>) => PlanX<E, I, B>, fa: FantasyX<E, I, A>
): FantasyX<E, I, B> {
  return fa.map(f)
}

export function lift<E extends HKTS, I, A, B>(
  f: (plan: PlanX<E, I, A>) => PlanX<E, I, B>
): (fa: FantasyX<E, I, A>) => FantasyX<E, I, B> {
  return fa => fa.map(f)
}

export function lift2<E extends HKTS, I, A, B, C>(
  f: (plan1: PlanX<E, I, A>, plan2: PlanX<E, I, B>) => PlanX<E, I, C>
): (fa1: FantasyX<E, I, A>, fa2: FantasyX<E, I, B>) => FantasyX<E, I, C> {
  return (fa1, fa2) => new FantasyX(f(fa1.plan, fa2.plan).apply)
}

export function combine<E extends HKTS, I, A>(
  f: (ua: StateP<A>, ub: StateP<A>) => StateP<A>
): (fa1: FantasyX<E, I, A>, fa2: FantasyX<E, I, A>) => FantasyX<E, I, A> {
  return lift2<E, I, A, A, A>((p1, p2) => p1.combine(f, p2))
}
