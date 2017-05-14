import { from, Stream } from 'most'
import { Subject } from 'most-subject'
import { Stamp } from './interfaces'
export class Traveler<S> {
  cursor: number
  path: Subject<(n: number) => number>
  history: Stream<Stamp<S>[]>
  travel: Stream<S>
  constructor(history: Stream<Stamp<S>[]>, path: Subject<(n: number) => number>) {
    this.history = history
    this.path = path
    this.travel = from(this.path)
      .sample((offset: (n: number) => number, states: Stamp<S>[]) => {
        let cursor = offset(states.length + this.cursor)
        if (cursor < states.length && cursor >= 0) {
          this.cursor = offset(this.cursor)
          return states[cursor].value;
        }
      }, this.path, this.history)
      .filter(x => !!x)
  }
  forward = () => {
    this.path.next(x => x + 1)
  }
  backward = () => {
    this.path.next(x => x - 1)
  }


}
export default function initHistory<S>(engineHistory: Subject<S>, engineTravel: Subject<(n: number) => number>): Traveler<S> {
  let history = from(engineHistory)
    .timestamp()
    .scan((acc: Stamp<S>[], state: Stamp<S>) => {
      acc.push(state)
      return acc;
    }, [])
    .multicast()
  return new Traveler(history, engineTravel)
}
