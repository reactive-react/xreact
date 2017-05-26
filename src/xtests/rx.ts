import { XREACT_ENGINE } from '../interfaces'
import { doSequence } from './util'
export default function Test() {
  this.plans = 0
  this.things = []
}
Test.prototype.plan = function(n) {
  this.plans = n
  return this
}
Test.prototype.do = function(things) {
  this.things = things
  return this
}
Test.prototype.collect = function(component) {
  let latestState
  if (this.plans != 0) {
    latestState = component.context[XREACT_ENGINE].history$.take(this.plans).toPromise()
  } else {
    latestState = component.context[XREACT_ENGINE].history$.toPromise()
  }
  doSequence(this.things).then(() => {
    if (this.plans == 0)
      component.machine.actions.terminate()
  })

  return latestState
}
