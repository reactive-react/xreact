import { XREACT_ENGINE } from '../interfaces'
export default function Test(initState) {
  this.plans = 0
  this.things = []
  this.initState = initState
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
function doSequence(tasks) {
  if (tasks.length == 1)
    return Promise.resolve(tasks[0]())
  else {
    let [head, ...tail] = tasks
    return Promise.resolve(head).then(f => {
      f();
      return doSequence(tail)
    })
  }

}
