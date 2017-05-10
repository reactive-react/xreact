import {Subject} from 'rxjs/Subject'
import {Observable} from 'rxjs/Observable'
import {from} from 'most'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/take'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/mergeAll'
export default function rxEngine() {
  Subject.prototype.send = Subject.prototype.next
  let historyStream = new Subject();
  historyStream.travel = new Subject();
  let intentStream = new Subject();
  function mergeObserve(actionsSinks, f){
    let subscriptions =  Observable.from(actionsSinks).mergeAll().subscribe(
      f,
      (e)=>console.error('Something is Wrong:',e, e.stack)
    )
    subscriptions.unsubscribe = subscriptions.dispose
    return subscriptions
  }
  return {intentStream,mergeObserve,historyStream}
}
