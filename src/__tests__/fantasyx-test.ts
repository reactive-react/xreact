import { streamOps } from '../xs'
import '../xs/array'
import { FantasyX } from '../fantasy/fantasyx'
import { Id } from '../fantasy/typeclasses/id'
import { Update } from '../interfaces'
import { Xstream } from '../fantasy/xstream'
import { flatMap, FlatMap } from '../fantasy/typeclasses/flatmap'
import { concat, Semigroup } from '../fantasy/typeclasses/semigroup'
describe('FantasyX', () => {
  let intent;
  beforeEach(() => {
    intent = streamOps.subject()
  })
  it('map and fold', () => {
    intent.next(1)
    intent.next(2)
    let res = Xstream
      .fromIntent()
      .toFantasyX()
      .map(a => {
        if (a == 1) {
          return { count: 5 }
        } else {
          return { count: 7 }
        }
      })
      .foldS((s, a) => ({ count: a.count + s.count }))
      .toStream(intent)
      .reduce((acc, f) => f(acc), { count: 10 })
    expect(res).toEqual({ count: 10 + 5 + 7 })
  })

  it('flatMap Xstream', () => {
    intent.next(1)
    intent.next(2)

    let res = FlatMap.Xstream.flatMap(
      (x: number) => Xstream.from(new Id({ count: x + 1 }))
      , Xstream.fromIntent<"ArrayStream", number>())
      .toFantasyX()
      .toStream(intent)
      .reduce((acc, f: any) => f(acc), { count: 10 })
    expect(res).toEqual({ count: 3 })
  })

  it('concat object', () => {
    intent.next({ count1: 1 })
    intent.next({ count2: 2 })

    let res = Semigroup.Xstream.concat(
      Xstream.fromIntent()
      , Xstream.fromIntent())
      .toFantasyX()
      .toStream(intent)
      .reduce((acc, f: any) => f(acc), { count: 0 })
    expect(res).toEqual({ "count": 0, "count1": 1, "count2": 2 })
  })

  it('concat promise', () => {

    let res = Semigroup.Xstream.concat(
      Xstream.from(new Id({ count1: 1 }))
      , Xstream.from(new Id({ count2: 2 })))
      .toFantasyX()
      .toStream(intent)
      .reduce((acc, f: any) => f(acc), { count: 0 })
    expect(res).toEqual({ "count": 0, "count1": 1, "count2": 2 })
  })
})
