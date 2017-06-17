export interface HKT<A> { }
export type HKTS = keyof HKT<any>
export namespace HKTOPS {
}
export interface FantasySubject<A> {
  next<A>(a: A): void
  complete<A>(a?: A): void
}
export interface Subscription {
  unsubscribe(): void;
}

export type Subject<F extends HKTS, A> = HKT<A>[F] & FantasySubject<A>

export interface XStream<F extends HKTS> {
  readonly URI: F
}

export class StreamOps<F extends HKTS> { }
export interface StreamOps<F extends HKTS> {
  empty<A>(): HKT<A>[F]
  merge<A>(
    a: HKT<A>[F],
    b: HKT<A>[F]
  ): HKT<A>[F]
  map<A, B>(f: (a: A) => B, fa: HKT<A>[F]): HKT<B>[F]
  subject<A>(): Subject<F, A>
  combine<A, B, C>(f: (a: A, b: B) => C, fa: HKT<A>[F], fb: HKT<B>[F]): HKT<C>[F]
  subscribe<A>(fa: HKT<A>[F], next: (v: A) => void, complete?: () => void)
}

export const streamOps = new StreamOps
