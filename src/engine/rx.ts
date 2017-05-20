import { Subject as RxSubject, Observable, Subscription } from '@reactivex/rxjs'
import { Update, Engine, Subject } from '../interfaces'

export default class RxEngine<T, S> implements Engine<T, S> {
  intentStream: Subject<T>
  historyStream: Subject<S>
  travelStream: Subject<(n: number) => number>
  constructor() {
    this.intentStream = new RxSubject()
    this.historyStream = new RxSubject()
    this.travelStream = new RxSubject()
  }

  observe(actionsSinks: Observable<Update<S>>, f, end): Subscription {
    return actionsSinks.subscribe(
      f,
      (e) => console.error('Something is Wrong:', e, e.stack),
      end,
    )
  }
  merge<T>(a: Observable<T>, b: Observable<T>) {
    return Observable.merge(a, b)
  }
}
