import { Subject, Observable, Subscription } from '@reactivex/rxjs';
import { Update, Engine } from '../interfaces';
export default class RxEngine<T, S> implements Engine<T, S> {
    intentStream: Subject<T>;
    historyStream: Subject<S>;
    travelStream: Subject<(n: number) => number>;
    constructor();
    observe(actionsSinks: Observable<Update<S>>, f: any): Subscription;
}
