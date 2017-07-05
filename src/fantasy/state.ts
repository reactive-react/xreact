import { pair, Partial } from './interfaces'
export class State<S, A> {
  runState: (s: S) => pair<S, A>
  constructor(runState: (s: S) => pair<S, A>) {
    this.runState = runState
  }
  static pure<A>(a: A) {
    return new State((s: any) => ({ s: s, a: a }))
  }

  chain<B>(f: (a: A) => State<S, B>): State<S, B> {
    return new State((state: S) => {
      let { a, s } = this.runState(state)
      return f(a).runState(s)
    })
  }

  runA(state: S): A {
    return this.runState(state).a
  }

  runS(state: S): S {
    return this.runState(state).s
  }

  static get<S>(): State<S, S> {
    return new State((s: S) => ({ s: s, a: s }))
  }

  static put<S>(s: S): State<S, void> {
    return new State((_: S) => ({ a: undefined, s: s }))
  }

  static modify<S>(f: (s: S) => S): State<S, void> {
    return new State((s: S) => ({ a: undefined, s: f(s) }))
  }

  static patch<S>(f: (s: S) => Partial<S>): State<S, Partial<S>> {
    return new State((s: S) => {
      let p = f(s)
      return {
        a: p, s: Object.assign({}, s, p)
      }
    })
  }
}
