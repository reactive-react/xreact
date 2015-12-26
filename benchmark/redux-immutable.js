var createStore =  require('redux').createStore
var timer = require('./timer')
var time = timer.time
var CYCLE = timer.CYCLE
var immutable = require('immutable')
var initState = [0]
for(var i=0;i<1000;i++)
  initState.push(i)

function counter(state, action) {
  state=immutable.fromJS(state||initState)
  switch (action.type) {
  case 'INCREMENT':
    return state.map(function(item){return item+1}).toJS()
  }
}

var store = createStore(counter)

time(function(done){
  store.subscribe(() => {
   done(store.getState()[0]) 
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
