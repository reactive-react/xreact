import {from } from 'most'

function getStreamOf(component, name) {
  let s = component.context[name];
  s.take$ = n => s.take(n).forEach(_=>_)
  return s
}

function historyStreamOf(component) {
  return getStreamOf(component, '__reactive.react.historyStream__')
}

function intentStreamOf(component) {
  return getStreamOf(component, '__reactive.react.intentStream__')
}

function do$(listOfActions) {
  return from(listOfActions).forEach(x=>x())
}

function sendTo(listOfIntent, component) {
  let s = intentStreamOf(component)
  return from(listOfIntent).forEach(i=>s.send(i))
}

export {do$, historyStreamOf, intentStreamOf}
