import { Observable, Subscription } from '@reactivex/rxjs';
import { Update, Engine, Subject } from '../interfaces';
export default class RxEngine<T, S> implements Engine<T, S> {
    intentStream: Subject<T>;
    historyStream: Subject<S>;
    travelStream: Subject<(n: number) => number>;
    constructor();
    observe(actionsSinks: Observable<Update<S>>, f: any, end: any): Subscription;
    merge<T>(a: Observable<T>, b: Observable<T>): Observable<T>;
}
