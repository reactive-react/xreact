import { StaticStream } from './index'
declare module './index' {
  interface HKT<A> {
    Array: Array<A>
  }
}
const combinators = []
const subcribes = {

}

export function map<A, B>(f: (a: A) => B, fa: Array<A>): Array<B> {
  return fa.map(f)
}

export function observe<A>({ next, error, complete }, fa: Array<A>) {
  next()
}
export function merge<A>(a: Array<A>, b: Array<A>): Array<A> {
  return []
}
export const URI = 'Array'
export type URI = typeof URI

  ; ({ map } as StaticStream<'Array'>)
