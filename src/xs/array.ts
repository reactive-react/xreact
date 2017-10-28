import { Subscription, StreamOps } from './index'

declare module '.' {
  interface S_<A> {
    'ArrayStream': Array<A>
  }
}

declare module '../fantasy/typeclasses' {
  interface _<A> {
    'ArrayStream': Array<A>
  }
}

StreamOps.prototype.empty = function() {
  return []
}

StreamOps.prototype.just = function(a) {
  return [a]
}

StreamOps.prototype.scan = function(f, base, fa) {
  return fa.scan(f, base)
}

StreamOps.prototype.combine = function <A, C>(
  f: (...a: any[]) => C,
  ...v: any[]
): Array<C> {
  return f.apply(null, v)
}

StreamOps.prototype.filter = function <A>(f: (a: A) => boolean, fa: Array<A>): Array<A> {
  return fa.filter(f)
}
StreamOps.prototype.map = function <A, B>(f: (a: A) => B, fa: Array<A>): Array<B> {
  return fa.map(f)
}
StreamOps.prototype.flatMap = function <A, B>(f: (a: A) => Array<B>, fa: Array<A>): Array<B> {
  return fa.reduce((acc, a) => acc.concat(f(a)), [] as B[])
}

function Subject() {
}
Subject.prototype = Array.prototype

Subject.prototype.next = function(a: any) {
  this.push(a)
}

Subject.prototype.complete = function() {
}

StreamOps.prototype.subject = function <A>() {
  return new (<any>Subject)()
}

StreamOps.prototype.subscribe = function <A>(fa: Array<A>, next: (v: A) => void, complete?: () => void) {
  throw Error("you don't need to subscribe a Array, just iterate it")
}

StreamOps.prototype.merge = function <A, B>(a: Array<A>, b: Array<B>): Array<A | B> {
  return (<any>a).concat(b)
}

StreamOps.prototype.fromPromise = function(p) {
  if (p.then) {
    throw Error("You're not using real Promise aren't you, expecting Id Monad")
  }
  return [p.valueOf()]
}

StreamOps.prototype.from = function(fa) {
  return [fa.valueOf()]
}
