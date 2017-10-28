import { datatype, $ } from '.'
import { Functor } from './functor'
import { ap, Apply } from './apply'
import { Cartesian } from './cartesian'
import { Applicative } from './applicative'
import { FlatMap } from './flatmap'
import { Monad } from './monad'

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

export class IdCartesian implements Cartesian<"Id"> {
  product<A, B>(fa: Id<A>, fb: Id<B>): Id<[A, B]> {
    return new Id([fa.value, fb.value] as [A, B])
  }
}

declare module './cartesian' {
  namespace Cartesian {
    export let Id: IdCartesian
  }
}

Cartesian.Id = new IdCartesian

export class IdApply implements Apply<"Id">  {
  ap<A, B>(fab: Id<(a: A) => B>, fa: Id<A>): Id<B> {
    return ap<"Id", A, B>(fab, fa)
  }
  map = Functor.Id.map
  product = Cartesian.Id.product
}

declare module './apply' {
  namespace Apply {
    export let Id: IdApply
  }
}

Apply.Id = new IdApply

export class IdApplicative extends IdApply implements Applicative<"Id">{
  pure<A>(a: A): Id<A> {
    return new Id(a)
  }
}

declare module './applicative' {
  namespace Applicative {
    export let Id: IdApplicative
  }
}

Applicative.Id = new IdApplicative


export class IdFlatMap extends IdApply implements FlatMap<"Id">{
  flatMap<A, B>(f: (a: A) => Id<B>, fa: Id<A>): Id<B> {
    return this.map(f, fa).value
  }
}

declare module './flatmap' {
  namespace FlatMap {
    export let Id: IdFlatMap
  }
}

FlatMap.Id = new IdFlatMap


export class IdMonad extends IdApplicative implements Monad<"Id">{
  flatMap = FlatMap.Id.flatMap
}

declare module './monad' {
  namespace Monad {
    export let Id: IdMonad
  }
}

Monad.Id = new IdMonad
