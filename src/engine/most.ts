import { from, of, mergeArray, Stream, never, Subscription } from 'most'
import { async as subject, AsyncSubject, Subject } from 'most-subject'
import { Update } from '../interfaces'
export default class Engine<T, S> {
  intentStream: Subject<T>
  historyStream: Subject<S>
  travelStream: Subject<(n: number) => number>
  constructor() {
    this.intentStream = subject() as Subject<T>
    this.historyStream = subject() as Subject<S>
    this.travelStream = subject() as Subject<(n: number) => number>;
  }

  observe<T>(actionsSinks: Stream<Update<T>>, f): Subscription<T> {
    let subscriptions = actionsSinks
      .recoverWith((e: Error) => {
        console.error('There is Error in your reducer:', e, e.stack)
        return of(x => x)
      })
      .subscribe({
        next: f,
        error: (e) => console.error('Something is Wrong:', e, e.stack),
        complete: f
      });
    return subscriptions;
  }
}
