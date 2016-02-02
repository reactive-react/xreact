import most from 'most'
export default function mostEngine() {
  let addToIntentStream = function(){
    console.error('intent stream not binded');
  };
  let intentStream = most.create(add => {
    addToIntentStream = add;
    return function dispose(e){
      addToIntentStream = id;
      console.log('action stream disposed');
    }
  });
  intentStream.drain();
  let addToHistoryStream = function(){
    console.error('history stream not binded');
  };
  let historyStream = most.create(add => {
    addToHistoryStream = add;
    return function dispose(e){
      addToHistoryStream = id;
      console.log('history stream disposed');
    }
  });
  historyStream.drain();

  function flatObserve(actionsSinks, f){
    return most.from(actionsSinks).join().observe(f);
  }

  return {intentStream, addToIntentStream, flatObserve, historyStream, addToHistoryStream}
}
