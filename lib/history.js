export default function initHistory(contextHistory){
  let history = contextHistory
        .timestamp()
        .scan((acc,state)=>{
          acc.push(state)
          return acc;
        }, [])
        .multicast()
  let travel = contextHistory.travel
  history.cursor = -1
  history.travel = travel
    .sample((offset,states)=>{
      let cursor = offset(states.length+history.cursor)
      if(cursor<states.length&&cursor>=0){
        history.cursor=offset(history.cursor)
        return states[cursor].value;
      }
    }, travel, history)
    .filter(x=>!!x)
  history.forward = function(){
    travel.send(x=>x+1)
  };
  history.backward = function(){
    travel.send(x=>x-1)
  }
  return history;
}
