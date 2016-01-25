import most from 'most'
const id = _=>_;
export default function mostify() {
  let addToIntentStream = function(){
    console.error('intent stream not binded');
  };
  let actionStream = most.create(add => {
    addToIntentStream = add;
    return function dispose(e){
      addToIntentStream = id;
      console.log('action stream disposed');
    }
  });
  actionStream.drain();

  function flatObserve(actionsSinks, f){
    return most.from(actionsSinks).join().observe(f);
  }
  return {actionStream, addToIntentStream, flatObserve}
}
