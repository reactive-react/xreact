import { Stream, Subscription } from 'most';
import { EngineSubject, Update } from '../interfaces';
export declare class Engine<T, S> {
    intentStream: EngineSubject<T>;
    historyStream: EngineSubject<S>;
    travelStream: EngineSubject<(n: number) => number>;
    constructor();
    observe<T>(actionsSinks: Stream<Update<T>>, f: any): Subscription<T>;
}
