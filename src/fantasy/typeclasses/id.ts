import { datatype, $ } from '.'
import { Functor } from './functor'

@datatype('Id')
export class Id<A> {
  value: A
  constructor(value: A) {
    this.value = value
  }
  valueOf() {
    return this.value
  }
}

export class IdFunctor implements Functor<"Id"> {
  map<A, B>(f: (a: A) => B, fb: $<"Id", A>): $<"Id", B> {
    return new Id(f(fb.value))
  }
}

declare module '.' {
  interface _<A> {
    "Id": Id<A>
  }
}

declare module './functor' {
  namespace Functor {
    export let Id: IdFunctor
  }
}

Functor.Id = new IdFunctor
