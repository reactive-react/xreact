// import { from, of, mergeArray, Stream, never, Subscription } from 'most'
// import { async as subject, AsyncSubject, Subject } from 'most-subject'
// import { Update, Engine } from '../interfaces'
// export default class MostEngine<T, S> implements Engine<T, S> {
//   intent$: Subject<T>
//   history$: Subject<S>
//   travel$: Subject<(n: number) => number>
//   constructor() {
//     this.intent$ = subject() as Subject<T>
//     this.history$ = subject() as Subject<S>
//     this.travel$ = subject() as Subject<(n: number) => number>;
//   }

//   observe(actionsSinks: Stream<Update<S>>, f, end): Subscription<S> {
//     let errorHandled = actionsSinks
//       .recoverWith((e: Error) => {
//         console.error('There is Error in your reducer:', e, e.stack)
//         return errorHandled
//       })
//     return errorHandled
//       .subscribe({
//         next: f,
//         error: (e) => console.error('Something is Wrong:', e, e.stack),
//         complete: end
//       });
//   }
// }
