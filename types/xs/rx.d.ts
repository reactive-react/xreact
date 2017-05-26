import { Observable } from '@reactivex/rxjs/dist/cjs/Observable';
import { Subject } from '@reactivex/rxjs/dist/cjs/Subject';
import { Subscription } from './index';
import '@reactivex/rxjs/dist/cjs/add/operator/map';
import '@reactivex/rxjs/dist/cjs/add/observable/merge';
import '@reactivex/rxjs/dist/cjs/add/operator/catch';
export declare const URI = "Observable";
export declare type URI = typeof URI;
declare module './index' {
    interface HKT<A> {
        Observable: Observable<A>;
    }
}
export declare function map<A, B>(f: (a: A) => B, fa: Observable<A>): Observable<B>;
export declare function subject<A>(): Subject<{}>;
export declare function subscribe<A>(fa: Observable<A>, next: (v: A) => void, complete?: () => void): Subscription;
export declare function merge<A>(a: Observable<A>, b: Observable<A>): Observable<A>;
