var reactMost = require('../react-most.js')
var Most = reactMost.default;
var timer = require('./timer')
var time = timer.time
var CYCLE = timer.CYCLE
var todolist;
var context = Most.prototype.getChildContext()
var most = require('most');
var log = _=>console.log(_)
var intentStream = context["__reactive.react.intentStream__"]
function genActions(intent$){
  var add$ = intent$.filter(x=>x.type=='add')
  var addState$ = add$.map((add)=>{
    return state=>({value:add.value})
  })
  var defaultState$ = most.of(_=>({value:0}))

  return {
    add: (value)=>({type:'add', value}),
    addState$,
    defaultState$,
  }
}

var actions = genActions(intentStream);
var state={value:0}
actions.addState$.observe(mapper=>{
  state=mapper(state);
  if(state.value==0){
    console.log('Memory Usage Before:', process.memoryUsage())
    start=new Date;
  }
  else if(state.value==CYCLE-1){
    console.log('Memory Usage After:', process.memoryUsage())
    console.log("Elapsed "+((new Date()).valueOf()-start.valueOf())+"ms");
  }
})

for(var i=0;i<CYCLE;i++){
  intentStream.send(actions.add(i))
}

/**
Memory Usage Before: { rss: 32501760, heapTotal: 16486912, heapUsed: 11307128 }
Memory Usage After: { rss: 34418688, heapTotal: 18550784, heapUsed: 11932336 }
Elapsed 8ms
 */
