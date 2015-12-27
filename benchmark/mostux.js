var EventEmitter = require('events').EventEmitter;
var tx = require('../transdux.js')
var txmixin = tx.TxMixin
var timer = require('./timer')
var time = timer.time
var CYCLE = timer.CYCLE


var inputChan = new EventEmitter;
var context = {
  transduxChannel: inputChan,
}

time(function(done){
  function Target(){
    return {
      context:context,
      state: {},
      setState: function(f){done(f(this.state))},
      constructor: Target
    }
  }
  var target = new Target()
  txmixin.bindActions.call(target, {
    increment: function(msg,state){
      return msg+1
    }
  })

  for(var i=0;i<CYCLE+1;i++){
    txmixin.dispatch.call(target, Target, 'increment', i)
  }
})
/**
Memory Usage Before: { rss: 45805568, heapTotal: 17518848, heapUsed: 12665456 }
Memory Usage After: { rss: 45764608, heapTotal: 29890048, heapUsed: 13124152 }
Elapsed 83ms
*/
