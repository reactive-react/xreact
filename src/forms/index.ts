import { pure } from '../fantasy'
import { Partial } from '../fantasy/interfaces'
import { HKTS, streamOps, HKT } from '../xs'
import { Update } from '../interfaces'
import { FantasyX } from '../fantasy/fantasyx'

export interface InputType {
  text: string
  number: number
  email: string
}

export function inputx<K extends keyof InputType,
  E extends HKTS,
  I extends Event,
  S>(name: string) {
  return pure<E, I, S>(intent$ => {
    return {
      update$:
      streamOps.map<InputType[K], Update<S>>(
        value => (state => ({ [name]: value }) as S),
        streamOps.map<Event, InputType[K]>(
          e => (e.target as HTMLFormElement).value,
          streamOps.filter<I>(i => {
            return i.type == 'change' && (i.target as HTMLFormElement).name == name
          }, (intent$ as HKT<I>[E])))
      )
    }
  })
}
