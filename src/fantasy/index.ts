import { HKTS, streamOps, HKT } from '../xs'
import { FantasyX } from './fantasyx'
import { Plan, Update } from '../interfaces'
import { StateP, Partial } from './interfaces'
import { State } from './state'

export function fromPlan<E extends HKTS, I, S>(plan: Plan<E, I, S>): FantasyX<E, I, S> {
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

export function pure<E extends HKTS, I, S>(s: S) {
  return new FantasyX<E, I, S>(intent$ => {
    return {
      update$: streamOps.map<I, StateP<S>>(() => State.pure<S>(s), intent$ as HKT<I>[E])
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
  return (fa1, fa2) => fa1.combine(f, fa2)
}

export function lift3<E extends HKTS, I, A>(
  f: (
    s1: Partial<A>,
    s2: Partial<A>,
    s3: Partial<A>
  ) => Partial<A>
): (fa1: FantasyX<E, I, A>, fa2: FantasyX<E, I, A>, fa3: FantasyX<E, I, A>) => FantasyX<E, I, A> {
  return (fa1, fa2, fa3) => fa1.combine3(f, fa2, fa3)
}

export function lift4<E extends HKTS, I, A>(
  f: (
    s1: Partial<A>,
    s2: Partial<A>,
    s3: Partial<A>,
    s4: Partial<A>
  ) => Partial<A>
): (
    fa1: FantasyX<E, I, A>,
    fa2: FantasyX<E, I, A>,
    fa3: FantasyX<E, I, A>,
    fa4: FantasyX<E, I, A>
  ) => FantasyX<E, I, A> {
  return (fa1, fa2, fa3, fa4) => fa1.combine4(f, fa2, fa3, fa4)
}


export function lift5<E extends HKTS, I, A>(
  f: (
    s1: Partial<A>,
    s2: Partial<A>,
    s3: Partial<A>,
    s4: Partial<A>,
    s5: Partial<A>
  ) => Partial<A>
): (
    fa1: FantasyX<E, I, A>,
    fa2: FantasyX<E, I, A>,
    fa3: FantasyX<E, I, A>,
    fa4: FantasyX<E, I, A>,
    fa5: FantasyX<E, I, A>
  ) => FantasyX<E, I, A> {
  return (fa1, fa2, fa3, fa4, fa5) => fa1.combine5(f, fa2, fa3, fa4, fa5)
}

export function concat<E extends HKTS, I, A>(
  fa: FantasyX<E, I, A>,
  fb: FantasyX<E, I, A>
): FantasyX<E, I, A> {
  return fa.concat(fb)
}
