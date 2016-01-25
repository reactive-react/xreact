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
Memory Usage Before: { rss: 21708800, heapTotal: 9275392, heapUsed: 4559768 }
Memory Usage After: { rss: 24592384, heapTotal: 10307328, heapUsed: 6277200 }
Elapsed 10ms
*/
