import {from, of, mergeArray} from 'most'
import {async as subject} from 'most-subject'
export default function Engine() {
  const intentStream = subject(),
        historyStream = subject(),
        travelStream = subject();
  intentStream.send = intentStream.next.bind(intentStream);
  historyStream.send = historyStream.next.bind(historyStream);
  travelStream.send = travelStream.next.bind(travelStream);

  function flatObserve(actionsSinks, f){
    let subscriptions = mergeArray(actionsSinks)
      .recoverWith(e => {
        console.error('There is Error in your reducer:',e, e.stack)
        return of(x=>x)
      })
      .subscribe({
        next:f,
        error: (e)=>console.error('Something is Wrong:',e, e.stack),
      });
    return subscriptions;
  }
  historyStream.travel = travelStream;
  return {intentStream, flatObserve, historyStream}
}
