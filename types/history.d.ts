import { Stream } from 'most';
import { Stamp, EngineSubject } from './interfaces';
export declare class Traveler<S> {
    cursor: number;
    path: EngineSubject<(n: number) => number>;
    history: Stream<Stamp<S>[]>;
    travel: Stream<S>;
    constructor(history: Stream<Stamp<S>[]>, path: EngineSubject<(n: number) => number>);
    forward(): void;
    backward(): void;
}
export default function initHistory<S>(engineHistory: EngineSubject<S>, engineTravel: EngineSubject<(n: number) => number>): Traveler<S>;
