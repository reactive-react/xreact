import { HKTS, streamOps } from '../xs'
import { FantasyX } from './fantasyx'
import { Plan, Update } from '../interfaces'
import { StateP, Partial } from './interfaces'
import { State } from './state'

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

export function concat<E extends HKTS, I, A>(
  fa: FantasyX<E, I, A>,
  fb: FantasyX<E, I, A>
): FantasyX<E, I, A> {
  return new FantasyX(fa.plan.concat(fb.plan).apply)
}
