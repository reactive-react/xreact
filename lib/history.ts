import { from, Stream } from 'most'

export interface Traveler<T, S> {
  cursor: number
  travel: (history: Stream<T>) => Stream<S>
  forward: () => void
  backward: () => void
  path: Stream<T>
}
export interface History<T, S> {
  traveler: Traveler<T, S>
  history: Stream<T>
}
export default function initHistory<T, S>(contextHistory: History<T, S>): [Stream<T>, Traveler<T, S>] {
  let history = from(contextHistory.history)
    .timestamp()
    .scan((acc, state) => {
      acc.push(state)
      return acc;
    }, [])
    .multicast()
  let traveler = {
    cursor: -1,
    travel: from(contextHistory.traveler.path)
      .sample((offset: (number) => number, states: [S]) => {
        let cursor = offset(states.length + contextHistory.traveler.cursor)
        if (cursor < states.length && cursor >= 0) {
          contextHistory.traveler.cursor = offset(contextHistory.traveler.cursor)
          return states[cursor].value;
        }
      }, contextHistory.traveler, history)
      .filter(x => !!x),
    forward: function() {
      contextHistory.traveler.path.send(x => x + 1)
    },
    backward: function() {
      contextHistory.traveler.path.send(x => x - 1)
    }
  }

  return [history, traveler]
}
