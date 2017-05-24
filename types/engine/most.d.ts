import { Stream } from 'most';
import { AsyncSubject } from 'most-subject';
import { Subscription } from './index';
export declare const URI = "sStream";
export declare type URI = typeof URI;
declare module './index' {
    interface HKT<A> {
        Stream: Stream<A>;
    }
}
export declare function map<A, B>(f: (a: A) => B, fa: Stream<A>): Stream<B>;
export declare function subject<A>(): AsyncSubject<{}>;
export declare function subscribe<A>(fa: Stream<A>, next: (v: A) => void, complete: () => void): Subscription;
export declare function merge<A>(a: Stream<A>, b: Stream<A>): Stream<A>;
