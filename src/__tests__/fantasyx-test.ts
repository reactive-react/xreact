import { Observable, Subject } from '@reactivex/rxjs'
import '../xs/rx'
import { FantasyX } from '../fantasy/fantasyx'
import { Update } from '../interfaces'
import { Xstream } from '../fantasy/xstream'
describe('FantasyX', () => {
  it('map', (done) => {
    let intent = new Subject()
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
    // .toPromise()
    // .then(x=>expect(x).toBe(''))
  })
})
