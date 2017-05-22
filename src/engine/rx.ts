// import { Subject, Observable, Subscription } from '@reactivex/rxjs'
// import { Update, Engine } from '../interfaces'

// interface HKT<K, T> {
//   __kind: K
//   __type: T
// }

// export default class RxEngine<T, S> implements Engine<T, S> {
//   intent$: Subject<T>
//   history$: Subject<S>
//   travel$: Subject<(n: number) => number>
//   constructor() {
//     this.intent$ = new Subject()
//     this.history$ = new Subject()
//     this.travel$ = new Subject()
//   }

//   observe(actionsSinks: Observable<Update<S>>, f): Subscription {
//     return actionsSinks.subscribe(
//       f,
//       (e) => console.error('Something is Wrong:', e, e.stack)
//     )
//   }
// }
