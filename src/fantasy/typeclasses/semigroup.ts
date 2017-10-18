export type instanceKey = keyof S
export type S = typeof Semigroup
import { datatype, kind } from '.'
export type SemigroupInstance = keyof typeof Semigroup
export type SemigroupInstanceType = typeof Semigroup[SemigroupInstance]['_T']
export interface Semigroup<A> {
  _T: A
  concat(a: any, b: any): A
}

export class NumberSemigroup implements Semigroup<number> {
  _T: number
  concat(a: any, b: any): number {
    return a + b
  }
}

export class ObjectSemigroup implements Semigroup<object> {
  _T: object
  concat(a: any, b: any): object {
    return Object.assign({}, a, b)
  }
}

export class PromiseSemigroup implements Semigroup<Promise<SemigroupInstanceType>> {
  _T: Promise<any>
  concat(a: any, b: any): Promise<SemigroupInstanceType> {
    return Promise.all([a, b]).then(([a, b]) => concat(a, b))
  }
}
export class StringSemigroup implements Semigroup<string> {
  _T: string
  concat(a: any, b: any): string {
    return a + b
  }
}

export class ArraySemigroup<A> implements Semigroup<Array<A>> {
  _T: Array<A>
  concat(a: Array<A>, b: Array<A>): Array<A> {
    return a.concat(b)
  }
}

export namespace Semigroup {
  export let Number = new NumberSemigroup
  export let String = new StringSemigroup
  export let Array = new ArraySemigroup<any>()
  export let Object = new ObjectSemigroup
  export let Promise = new PromiseSemigroup
}

export function concat<A extends SemigroupInstanceType>(a: A, b: A): A {
  let instance = (<any>Semigroup)[kind(a)]
  return instance.concat(a, b)
}
