var reactMost = require('../react-most.js')
var Most = reactMost.default;
var timer = require('./timer')
var time = timer.time
var CYCLE = timer.CYCLE
var todolist;
var context = Most.prototype.getChildContext()
var most = require('most');

var stateStream = context["Symbol('state stream')"]
var intentStream = most.of({type:'add'}).cycle().take(CYCLE)
var addToStateStream =  context["Symbol('add state to state stream')"];
var counter = 0;
function genActions(prevState$, intent$){
  var add$ = intent$.filter(x=>x.type=='add')
  var addState$ = add$.map((add)=>{
    counter++;
    return state=>({value:counter})
  })
        .startWith(_=>({value:0}))

  return {
    add: (id)=>({type:'add', id}),
    addState$,
  }
}

var actions = genActions(stateStream, intentStream);

actions.addState$.observe(add=>addToStateStream(add()));
stateStream.observe(state=>{
    if(state.value==0){
          console.log('Memory Usage Before:', process.memoryUsage())
          start=new Date;
        }
    else if(state.value==CYCLE-1){
          console.log('Memory Usage After:', process.memoryUsage())
          console.log("Elapsed "+((new Date()).valueOf()-start.valueOf())+"ms");
        }
      })
/**
Memory Usage Before: { rss: 31404032, heapTotal: 16486912, heapUsed: 10390552 }
Memory Usage After: { rss: 35303424, heapTotal: 18550784, heapUsed: 10074400 }
Elapsed 16ms
 */
