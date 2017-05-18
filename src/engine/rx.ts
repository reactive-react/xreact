import { Subject, Observable, Subscription } from '@reactivex/rxjs'
import { Update } from '../interfaces'

export default class Engine<T, S> {
  intentStream: Subject<T>
  historyStream: Subject<S>
  travelStream: Subject<(n: number) => number>
  constructor() {
    this.intentStream = new Subject()
    this.historyStream = new Subject()
    this.travelStream = new Subject()
  }

  observe(actionsSinks: Observable<Update<S>>, f): Subscription {
    return actionsSinks.subscribe(
      f,
      (e) => console.error('Something is Wrong:', e, e.stack)
    )
  }
}
