import Rx from 'rx'
export default function rxEngine() {
  Rx.Subject.prototype.send = Rx.Subject.prototype.onNext
  let historyStream = new Rx.Subject();
  historyStream.travel = new Rx.Subject();
  let intentStream = new Rx.Subject();
  function flatObserve(actionsSinks, f){
    return Rx.Observable.from(actionsSinks).mergeAll().subscribe(f);
  }
  return {intentStream,flatObserve,historyStream}
}
