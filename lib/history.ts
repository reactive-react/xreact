import { from, Stream } from 'most'
import { EngineSubject } from './engine/most'
export interface Path<T> extends Stream<T> {
  send: (fn: T) => void
}
export class Traveler<S> {
  cursor: number
  path: EngineSubject<(n: number) => number>
  history: Stream<Stamp<S>[]>
  constructor(history: Stream<Stamp<S>[]>, path: EngineSubject<(n: number) => number>) {
    this.history = history
    this.path = path
  }
  forward() {
    this.path.send(x => x + 1)
  }
  backward() {
    this.path.send(x => x - 1)
  }
  travel = from(this.path)
    .sample((offset: (n: number) => number, states: Stamp<S>[]) => {
      let cursor = offset(states.length + this.cursor)
      if (cursor < states.length && cursor >= 0) {
        this.cursor = offset(this.cursor)
        return states[cursor].value;
      }
    }, this.path, this.history)
    .filter(x => !!x)

}
export interface History<S> {
  path: Path<(n: number) => number>
  history: Stream<S>
}

export interface Stamp<S> {
  value: S
  time: number
}
export default function initHistory<S>(engineHistory: EngineSubject<S>, engineTravel: EngineSubject<(n: number) => number>): Traveler<S> {
  let history = from(engineHistory)
    .timestamp()
    .scan((acc: Stamp<S>[], state: Stamp<S>) => {
      acc.push(state)
      return acc;
    }, [])
    .multicast()
  return new Traveler(history, engineTravel)
}
