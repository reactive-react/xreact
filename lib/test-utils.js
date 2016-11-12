import * as most from 'most'
function historyStreamOf(component) {
  let historyStream = component.context['__reactive.react.historyStream__'];
  historyStream.take$ = n => historyStream.take(n).forEach(_=>_)
  return historyStream
}

function intentStreamOf(component) {
  return component.context['__reactive.react.intentStream__'];
}

function do$(listOfActions) {
  return most.from(listOfActions).forEach(x=>x())
}

export {do$, historyStreamOf, intentStreamOf}
