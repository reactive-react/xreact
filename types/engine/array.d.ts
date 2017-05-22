declare module './index' {
    interface HKT<A> {
        Array: Array<A>;
    }
}
export declare function map<A, B>(f: (a: A) => B, fa: Array<A>): Array<B>;
export declare function observe<A>({next, error, complete}: {
    next: any;
    error: any;
    complete: any;
}, fa: Array<A>): void;
export declare function merge<A>(a: Array<A>, b: Array<A>): Array<A>;
export declare const URI = "Array";
export declare type URI = typeof URI;
export {};
