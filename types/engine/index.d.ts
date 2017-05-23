export interface HKT<A> {
}
export declare type HKTS = keyof HKT<any>;
export interface FantasySubject<A> {
    next<A>(a: A): void;
    complete<A>(a?: A): void;
}
export interface Subscription {
    unsubscribe(): void;
}
export declare type Subject<F extends HKTS, A> = HKT<A>[F] & FantasySubject<A>;
export interface StaticStream<F extends HKTS> {
    readonly URI: F;
    subject<A>(): HKT<A>[F] & FantasySubject<A>;
    map<A, B>(f: (a: A) => B, fa: HKT<A>[F]): HKT<B>[F];
    merge<A>(a: HKT<A>[F], b: HKT<A>[F]): HKT<A>[F];
    subscribe<A>(fa: HKT<A>[F], next: (v: A) => void, complete: () => void): Subscription;
}
