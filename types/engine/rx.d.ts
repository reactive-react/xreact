import { Subject } from '@reactivex/rxjs/src/Subject';
import { Observable } from '@reactivex/rxjs/src/Observable';
import { Subscription } from '@reactivex/rxjs/src/Subscription';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/mergeAll';
import { Update } from '../interfaces';
export default class Engine<T, S> {
    intentStream: Subject<T>;
    historyStream: Subject<S>;
    travelStream: Subject<(n: number) => number>;
    constructor();
    observe(actionsSinks: Observable<Update<T>>, f: any): Subscription;
}
