export interface M_<A> { }
export type Stream = keyof M_<any>

export interface FantasySubject<A> {
  next<A>(a: A): void
  complete<A>(a?: A): void
}
export interface Subscription {
  unsubscribe(): void;
}

export type Subject<F extends Stream, A> = M_<A>[F] & FantasySubject<A>

export interface XStream<F extends Stream> {
  readonly URI: F
}

export class StreamOps<F extends Stream> { }
export interface StreamOps<F extends Stream> {
  empty<A>(): M_<A>[F]
  just<A>(a: A): M_<A>[F]
  merge<A>(
    a: M_<A>[F],
    b: M_<A>[F]
  ): M_<A>[F]
  scan<A, B>(
    f: (acc: B, cur: A) => B,
    base: B,
    fa: M_<A>[F]
  ): M_<B>[F]
  map<A, B>(f: (a: A) => B, fa: M_<A>[F]): M_<B>[F]
  filter<A>(f: (a: A) => boolean, fa: M_<A>[F]): M_<A>[F]
  flatMap<A, B>(f: (a: A) => M_<B>[F], fa: M_<A>[F]): M_<B>[F]
  subject<A>(): Subject<F, A>
  combine<A, B, C>(
    f: (a: A, b: B) => C,
    fa: M_<A>[F],
    fb: M_<B>[F]
  ): M_<C>[F]
  combine<A, B, C, D>(
    f: (a: A, b: B, c: C) => D,
    fa: M_<A>[F],
    fb: M_<B>[F],
    fc: M_<C>[F]
  ): M_<D>[F]
  combine<A, B, C, D, E>(
    f: (a: A, b: B, c: C, d: D) => E,
    fa: M_<A>[F],
    fb: M_<B>[F],
    fc: M_<C>[F],
    fd: M_<D>[F]
  ): M_<E>[F]
  combine<A, B, C, D, E, G>(
    f: (a: A, b: B, c: C, d: D, e: E) => G,
    fa: M_<A>[F],
    fb: M_<B>[F],
    fc: M_<C>[F],
    fd: M_<D>[F],
    fe: M_<E>[F]
  ): M_<G>[F]
  combine<A, B, C, D, E, G, H>(
    f: (a: A, b: B, c: C, d: D, e: E, g: G) => H,
    fa: M_<A>[F],
    fb: M_<B>[F],
    fc: M_<C>[F],
    fd: M_<D>[F],
    fe: M_<E>[F],
    fg: M_<G>[F]
  ): M_<H>[F]
  subscribe<A>(fa: M_<A>[F], next: (v: A) => void, complete?: () => void): Subscription
}

export const streamOps: StreamOps<Stream> = new StreamOps
