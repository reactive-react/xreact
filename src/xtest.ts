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
  let latestState = component.machine.update$
    .catch(x => {
      console.error(x)
      return component.machine.update$
    })
    .do(f => { if (process.env.NODE_ENV == 'debug') console.log("UPDATE:", f) })
    .scan((cs, f) => f.call(null, cs), this.initState)
    .do(x => { if (process.env.NODE_ENV == 'debug') console.log("STATE:", x) })
    .take(this.plans).toPromise()
  this.things.forEach(f => f())
  return latestState
}
