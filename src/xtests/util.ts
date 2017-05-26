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

export function doSequence(tasks) {
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
