export interface _<A> { }

export type HKT = keyof _<any>

export type $<F extends HKT, A> = _<A>[F]
import 'reflect-metadata'

export function datatype(name: string) {
  return (constructor: Function) => {
    Reflect.defineMetadata('design:type', name, constructor);
  }
}

export function kind(target: any) {
  if (isPrimitive(target))
    return target.constructor.name
  return Reflect.getMetadata('design:type', target.constructor);
}

datatype('Array')(Array)
declare module '.' {
  export interface _<A> {
    "Array": Array<A>
  }
}

function isPrimitive(a: any): boolean {
  return ['string', 'number', 'symbol', 'boolean'].indexOf(typeof a) >= 0
}
