export interface _<A> {
  "Array": Array<A>
}

export type HKT = keyof _<any>

export type $<F extends HKT, A> = _<A>[F]
import 'reflect-metadata'

export function datatype(name: string) {
  return (constructor: Function) => {
    Reflect.defineMetadata('design:type', name, constructor);
  }
}

export function kind(target: any) {
  if (isPrimitive(target)) {
    return target.constructor.name
  }
  else {
    let tag = Reflect.getMetadata('design:type', target.constructor);
    if (tag) return tag
    throw new Error(`target ${target.constructor} is not a datatype, please decorate it with @datatype!`)
  }

}

datatype('Array')(Array)
datatype('Object')(Object)
datatype('Promise')(Promise)


function isPrimitive(a: any): boolean {
  return ['string', 'number', 'symbol', 'boolean'].indexOf(typeof a) >= 0
}
