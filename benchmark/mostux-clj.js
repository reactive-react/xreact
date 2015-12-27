var conjs = require('con.js');
var EventEmitter = require('events').EventEmitter
var tx = require('../mostux.js')
var txmixin = tx.TxMixin
var timer = require('./timer')
var time = timer.time
var CYCLE = timer.CYCLE
var toJs = conjs.toJs
var toClj = conjs.toClj
var context = {
  mostuxChannel: new EventEmitter,
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
      return state.map(function(m){return msg+1})
    }
  }, toClj, toJs)

  for(var i=0;i<CYCLE+1;i++){
    txmixin.dispatch.call(target, Target, 'increment', i)
  }
})
