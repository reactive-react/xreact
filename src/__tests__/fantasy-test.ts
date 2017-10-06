import { Id } from '../fantasy/typeclasses/id'
import { Functor, map } from '../fantasy/typeclasses/functor'

import { concat } from '../fantasy/typeclasses/semigroup'
import { Xstream } from '../fantasy/xstream'

describe('fantasy', () => {
  describe('functor ID', () => {
    it('map just apply ', () => {
      expect(map((a: number) => a + 1, new Id(23)).valueOf()).toEqual(24)
    })
  })

  describe('functor Array', () => {
    it('map', () => {
      expect(map((a: number) => a + 1, [1, 2, 3])).toEqual([2, 3, 4])
    })
  })
})

describe('semigroup', () => {
  describe('concat', () => {
    it('String', () => {
      expect(concat("hello", "world")).toEqual("helloworld")
    })

    it('Array', () => {
      expect(concat(["hello"], ["world"])).toEqual(["hello", "world"])
    })

    it('Number', () => {
      expect(concat(1, 2)).toEqual(3)
    })
  })
})
