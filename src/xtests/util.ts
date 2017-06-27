export class Test {
  plans: number
  things: any[]
  constructor() {
    this.plans = 0
    this.things = []
  }
  plan(n) {
    this.plans = n
    return this
  }

  do(things) {
    this.things = things
    return this
  }
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
