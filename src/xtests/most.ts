import { XREACT_ENGINE } from '../interfaces'
import { doSequence, Test } from './util'
export default class extends Test {
  collect(component) {
    let latestState
    if (this.plans != 0) {
      latestState = component.context[XREACT_ENGINE].history$.take(this.plans).observe(() => { })
    } else {
      latestState = component.context[XREACT_ENGINE].history$.observe(() => { })
    }
    doSequence(this.things).then(() => {
      if (this.plans == 0)
        component.machine.actions.terminate()
    })

    return latestState
  }
}
