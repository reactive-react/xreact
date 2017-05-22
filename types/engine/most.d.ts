import { Stream, Subscription } from 'most';
import { Subject } from 'most-subject';
import { Update, Engine } from '../interfaces';
export default class MostEngine<T, S> implements Engine<T, S> {
    intent$: Subject<T>;
    history$: Subject<S>;
    travel$: Subject<(n: number) => number>;
    constructor();
    observe(actionsSinks: Stream<Update<S>>, f: any, end: any): Subscription<S>;
}
