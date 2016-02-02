import Rx from 'rx'
export default function rxEngine() {
  let addToIntentStream = subject.onNext;
  let actionStream = new Rx.Subject();

  function flatObserve(actionsSinks, f){
    return Rx.Observable.from(actionsSinks).mergeAll().observe(f);
  }
  return {actionStream, addToIntentStream, flatObserve}
}
