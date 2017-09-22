import { Stream, streamOps, M_ } from '../xs'
import { Update, fromPlan } from '..'
import { FantasyX } from '../fantasy/fantasyx'
import { Partial } from '../fantasy/interfaces'

export type AnyProps = {
  [name: string]: any
}

export function xinput<
  E extends Stream,
  I extends Event,
  S extends AnyProps>(name: keyof S) {
  return fromPlan<E, I, S>(intent$ => {
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
            let target = i.target as HTMLFormElement
            return target.tagName == 'INPUT' && target.name == name
          }, (intent$ as M_<I>[E])))
      )
    }
  })
}
