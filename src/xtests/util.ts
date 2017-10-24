export class Test {
  plans: number
  things: any[]
  constructor() {
    this.plans = 0
    this.things = []
  }
  plan(n: number) {
    this.plans = n
    return this
  }

  do(things: any[]) {
    this.things = things
    return this
  }
}
export function doSequence(tasks: any[]): Promise<any> {
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
