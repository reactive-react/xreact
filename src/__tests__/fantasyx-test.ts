import { Observable, Subject } from '@reactivex/rxjs'
import '../xs/rx'
import { FantasyX } from '../fantasy/fantasyx'
import { Update } from '../interfaces'
import { Xstream } from '../fantasy/xstream'
import { flatMap, FlatMap } from '../fantasy/typeclasses/flatmap'
import { concat, Semigroup } from '../fantasy/typeclasses/semigroup'
describe('FantasyX', () => {
  let intent;
  beforeEach(() => {
    intent = new Subject()
  })
  it('map and fold', (done) => {
    Xstream
      .fromIntent()
      .toFantasyX()
      .map(a => {
        if (a == 1) {
          return { count: 5 }
        } else {
          return { count: 7 }
        }
      })
      .fold((s, a) => ({ count: a.count + s.count }))
      .toStream(intent)
      .reduce((acc, f: any) => {
        return f(acc)
      }, { count: 10 })
      .subscribe(a => {
        expect(a.count).toBe(22)// 5 + 10 + 7
        done()
      });
    intent.next(1)
    intent.next(2)
    intent.complete()
  })

  it('flatMap Xstream', (done) => {
    FlatMap.Xstream.flatMap(
      (x: number) => Xstream.fromPromise<"RxStream", number, number>(Promise.resolve({ count: x + 1 }))
      , Xstream.fromIntent<"RxStream", number>())
      .toFantasyX()
      .toStream(intent)
      .reduce((acc, f: any) => f(acc), { count: 10 })
      .toPromise().then(a => expect(a).toEqual({ count: 3 })).then(done)
    intent.next(1)
    intent.next(2)
    intent.complete()
  })

  it('concat object', (done) => {
    Semigroup.Xstream.concat(
      Xstream.fromIntent()
      , Xstream.fromIntent())
      .toFantasyX()
      .toStream(intent)
      .reduce((acc, f: any) => f(acc), { count: 0 })
      .toPromise()
      .then(a => expect(a).toEqual(
        { "count": 0, "count1": 1, "count2": 2 }
      ))
      .then(done)
    intent.next({ count1: 1 })
    intent.next({ count2: 2 })
    intent.complete()
  })

  it('concat promise', (done) => {
    Semigroup.Xstream.concat(
      Xstream.fromPromise(Promise.resolve({ count1: 1 }))
      , Xstream.fromPromise(Promise.resolve({ count2: 2 })))
      .toFantasyX()
      .toStream(intent)
      .reduce((acc, f: any) => f(acc), { count: 0 })
      .toPromise()
      .then(a => expect(a).toEqual(
        { "count": 0, "count1": 1, "count2": 2 }
      ))
      .then(done)
  })
})
