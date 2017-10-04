
export type instanceKey = keyof S
export type S = typeof Semigroup
export type instances = S[instanceKey]["_T"]
export interface Semigroup<A> {
  concat(a: any, b: any): A
}

export class NumberSemigroup implements Semigroup<number> {
  _T: number
  concat(a:any, b:any):number {
    return a + b
  }
}

export class StringSemigroup implements Semigroup<string> {
  _T: string
  concat(a: any, b: any):string {
    return a + b
  }
}
export namespace Semigroup {
  export let Number = new NumberSemigroup
  export let String = new StringSemigroup
}

export function concat<A extends instances> (a:A,b:A){
  let c = <instanceKey>a.constructor.name
  return <A>Semigroup[c].concat(a,b)
}

var c = concat("asf","sdf")
var d = c+1