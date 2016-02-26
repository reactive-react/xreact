import most from 'most'
export default function mostEngine() {
  let addToIntentStream = function(){
    console.error('intent stream not binded yet');
  };
  let intentStream = most.create(add => {
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
  let historyStream = most.create(add => {
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

  let travelStream = most.create(add => {
    addToTravelStream = add;
    return function dispose(e){
      addToTravelStream = null;
      console.log('travel stream disposed');
    }
  });
  travelStream.drain();
  travelStream.send = addToTravelStream;

  function flatObserve(actionsSinks, f){
    return most.from(actionsSinks).join().observe(f);
  }
  historyStream.travel = travelStream;
  return {intentStream, flatObserve, historyStream}
}
