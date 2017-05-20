import { Stream, Subscription } from 'most';
import { Subject } from 'most-subject';
import { Update, Engine } from '../interfaces';
export default class MostEngine<T, S> implements Engine<T, S> {
    intentStream: Subject<T>;
    historyStream: Subject<S>;
    travelStream: Subject<(n: number) => number>;
    constructor();
    observe(actionsSinks: Stream<Update<S>>, f: any, end: any): Subscription<any>;
    merge<T>(a: Stream<T>, b: Stream<T>): Stream<T>;
}
