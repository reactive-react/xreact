import {create} from '@most/create'
import {from,mergeArray} from 'most'
import {subject} from 'most-subject'
export default function Engine() {
  const intentStream = subject(),
        historyStream = subject(),
        travelStream = subject();
  intentStream.send = intentStream.next.bind(intentStream);
  historyStream.send = historyStream.next.bind(historyStream);
  travelStream.send = travelStream.next.bind(travelStream);

  function flatObserve(actionsSinks, f){
    return mergeArray(actionsSinks).observe(f);
  }
  historyStream.travel = travelStream;
  return {intentStream, flatObserve, historyStream}
}
