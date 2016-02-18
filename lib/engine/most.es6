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
  function flatObserve(actionsSinks, f){
    return most.from(actionsSinks).join().observe(f);
  }

  return {intentStream, flatObserve, historyStream}
}
