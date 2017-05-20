import { Stamp, Stream, Subject } from './interfaces';
import { Stream as MStream } from 'most';
export declare class Traveler<S> {
    cursor: number;
    path: Subject<(n: number) => number>;
    history: Stream<Stamp<S>[]>;
    travel: Stream<S>;
    constructor(history: MStream<Stamp<S>[]>, path: Subject<(n: number) => number>);
    forward: () => void;
    backward: () => void;
}
export default function initHistory<S>(engineHistory: Subject<S>, engineTravel: Subject<(n: number) => number>): Traveler<S>;
