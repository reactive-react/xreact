import { HKTS, streamOps, HKT } from '../xs'
import { Update, pure } from '..'
import { FantasyX } from '../fantasy/fantasyx'
import { Partial } from '../fantasy/interfaces'

export type AnyProps = {
  [name: string]: any
}

export function xinput<
  E extends HKTS,
  I extends Event,
  S extends AnyProps>(name: keyof S) {
  return pure<E, I, S>(intent$ => {
    return {
      update$:
      streamOps.map<string, Update<S>>(
        value => (state => {
          let result = <S>{}
          result[name] = value
          return result as Partial<S>
        }),
        streamOps.map<Event, string>(
          e => (e.target as HTMLFormElement).value,
          streamOps.filter<I>(i => {
            return i.type == 'change' && (i.target as HTMLFormElement).name == name
          }, (intent$ as HKT<I>[E])))
      )
    }
  })
}
