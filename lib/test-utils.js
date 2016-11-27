import {from } from 'most'
import {INTENT_STREAM, HISTORY_STREAM} from './react-most'
function getStreamOf(component, name) {
  let s = from(component.context[name]);
  s.take$ = n => s.take(n).forEach(_=>_)
  return s
}

function historyStreamOf(component) {
  return getStreamOf(component, HISTORY_STREAM)
}

function intentStreamOf(component) {
  return getStreamOf(component, INTENT_STREAM)
}

function do$(listOfActions) {
  return from(listOfActions).forEach(x=>x())
}

function dispatch(listOfIntent, component) {
  let s = component.context[INTENT_STREAM]
  return from(listOfIntent).forEach(i=>s.send(i))
}

export {do$, historyStreamOf, intentStreamOf, dispatch}
