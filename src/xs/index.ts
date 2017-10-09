import { _, $ } from '../fantasy/typeclasses'
export interface S_<A> { }
export type Stream = keyof S_<any>

export interface FantasySubject<A> {
  next<A>(a: A): void
  complete<A>(a?: A): void
}
export interface Subscription {
  unsubscribe(): void;
}

export type Subject<F extends Stream, A> = $<F, A> & FantasySubject<A>
export type $<F extends Stream, A> = $<F, A>

export class StreamOps<F extends Stream> { }
export interface StreamOps<F extends Stream> {
  empty<A>(): $<F, A>
  fromPromise<A>(p: Promise<A>): $<F, A>
  just<A>(a: A): $<F, A>
  merge<A>(
    a: $<F, A>,
    b: $<F, A>
  ): $<F, A>
  scan<A, B>(
    f: (acc: B, cur: A) => B,
    base: B,
    fa: $<F, A>
  ): $<F, B>
  map<A, B>(f: (a: A) => B, fa: $<F, A>): $<F, B>
  filter<A>(f: (a: A) => boolean, fa: $<F, A>): $<F, A>
  flatMap<A, B>(f: (a: A) => $<F, B>, fa: $<F, A>): $<F, B>
  subject<A>(): Subject<F, A>
  combine<A, B, C>(
    f: (a: A, b: B) => C,
    fa: $<F, A>,
    fb: $<F, B>
  ): $<F, C>
  combine<A, B, C, D>(
    f: (a: A, b: B, c: C) => D,
    fa: $<F, A>,
    fb: $<F, B>,
    fc: $<F, C>
  ): $<F, D>
  combine<A, B, C, D, E>(
    f: (a: A, b: B, c: C, d: D) => E,
    fa: $<F, A>,
    fb: $<F, B>,
    fc: $<F, C>,
    fd: $<F, D>
  ): $<F, E>
  combine<A, B, C, D, E, G>(
    f: (a: A, b: B, c: C, d: D, e: E) => G,
    fa: $<F, A>,
    fb: $<F, B>,
    fc: $<F, C>,
    fd: $<F, D>,
    fe: $<F, E>
  ): $<F, G>
  combine<A, B, C, D, E, G, H>(
    f: (a: A, b: B, c: C, d: D, e: E, g: G) => H,
    fa: $<F, A>,
    fb: $<F, B>,
    fc: $<F, C>,
    fd: $<F, D>,
    fe: $<F, E>,
    fg: $<F, G>
  ): $<F, H>
  subscribe<A>(fa: $<F, A>, next: (v: A) => void, complete?: () => void): Subscription
}

export const streamOps: StreamOps<Stream> = new StreamOps
