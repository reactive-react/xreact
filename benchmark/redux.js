var createStore =  require('redux').createStore
var timer = require('./timer')
var time = timer.time
var CYCLE = timer.CYCLE

function counter(state, action) {
  state=state||0
  switch (action.type) {
  case 'INCREMENT':
    return state + 1
  }
}

var store = createStore(counter)

time(function(done){
  store.subscribe(() => {
   done(store.getState()) 
  })
  for(var i=0;i<CYCLE+1;i++){
    store.dispatch({ type: 'INCREMENT' });
  }
})
/**
Memory Usage Before: { rss: 21942272, heapTotal: 9275392, heapUsed: 4559784 }
Memory Usage After: { rss: 22929408, heapTotal: 9275392, heapUsed: 5473240 }
Elapsed 4ms
*/
