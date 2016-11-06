import {create} from '@most/create'
import {from,mergeArray} from 'most'
export default function Engine() {
  let addToIntentStream = function(){
    console.error('intent stream not binded yet');
  };
  let intentStream = create(add => {
    addToIntentStream = add;
    return function dispose(e){
      addToIntentStream = null;
      console.log('action stream disposed');
    }
  });
  intentStream.drain();
  intentStream.send = addToIntentStream;
  let addToHistoryStream = function(){
    console.error('history stream not binded yet');
  };
  let historyStream = create(add => {
    addToHistoryStream = add;
    return function dispose(e){
      addToHistoryStream = null;
      console.log('history stream disposed');
    }
  });
  historyStream.drain();
  historyStream.send = addToHistoryStream;

  let addToTravelStream = function(){
    console.error('travel stream not binded yet');
  };

  let travelStream = create(add => {
    addToTravelStream = add;
    return function dispose(e){
      addToTravelStream = null;
      console.log('travel stream disposed');
    }
  });
  travelStream.drain();
  travelStream.send = addToTravelStream;

  function flatObserve(actionsSinks, f){
    return mergeArray(actionsSinks).observe(f);
  }
  historyStream.travel = travelStream;
  return {intentStream, flatObserve, historyStream}
}
