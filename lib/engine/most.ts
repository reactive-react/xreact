import { from, of, mergeArray, Stream, never, Subscription } from 'most'
import { async as subject, AsyncSubject } from 'most-subject'

export interface EngineSubject<T> extends AsyncSubject<T> {
  send(x: T): this
}

export interface Update<S> {
  (current: S): S
}

export class Engine<T, S> {
  intentStream: EngineSubject<T>
  historyStream: EngineSubject<S>
  travelStream: EngineSubject<(n: number) => number>
  constructor() {
    this.intentStream = subject() as EngineSubject<T>
    this.intentStream.send = this.intentStream.next.bind(this.intentStream)
    this.historyStream = subject() as EngineSubject<S>
    this.historyStream.send = this.historyStream.next.bind(this.historyStream)
    this.travelStream = subject() as EngineSubject<(n: number) => number>;
    this.travelStream.send = this.travelStream.next.bind(this.historyStream)
  }

  observe<T>(actionsSinks: Stream<Update<T>>[], f): Subscription<T> {
    let subscriptions = mergeArray(actionsSinks)
      .recoverWith(e => {
        // console.error('There is Error in your reducer:', e, e.stack)
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
