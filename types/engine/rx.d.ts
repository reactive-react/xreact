import { Subject, Observable, Subscription } from '@reactivex/rxjs';
import { Update } from '../interfaces';
export default class Engine<T, S> {
    intentStream: Subject<T>;
    historyStream: Subject<S>;
    travelStream: Subject<(n: number) => number>;
    constructor();
    observe(actionsSinks: Observable<Update<S>>, f: any): Subscription;
}
