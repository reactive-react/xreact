var conjs = require('con.js');
var tx = require('../transdux.js')
var txmixin = tx.TxMixin
var timer = require('./timer')
var time = timer.time
var CYCLE = timer.CYCLE
var toJs = conjs.toJs
var toClj = conjs.toClj
var inputChan = conjs.async.chan()
var outputChan = conjs.async.chan()
var context = {
  transduxChannel: inputChan,
  transduxPublication: conjs.async.pub(inputChan, function(_){return _['action']}),
}

var initState = [0]
for(var i=0;i<1000;i++)
  initState.push(i)

time(function(done){
  function Target(){
    return {
      getInitialState: function(){return initState},
      context:context,
      state: [0],
      setState: function(f){
        this.state=f(this.state)
        done(this.state[0])
      },
      constructor: Target
    }
  }
  var target = new Target()
  txmixin.bindActions.call(target, {
    increment: function(msg,state){
      return conjs.map(function(m){return msg+1}, state)
    }
  }, toClj, toJs)

  for(var i=0;i<CYCLE+1;i++){
    txmixin.dispatch.call(target, Target, 'increment', i)
  }
})
