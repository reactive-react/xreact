var CYCLE = 1023
exports.time = function(f) {
  console.log('Memory Usage Before:', process.memoryUsage())
  var s = new Date();
  f(function(index){
    if(index==CYCLE){
      console.log('Memory Usage After:', process.memoryUsage())
      console.log("Elapsed "+((new Date()).valueOf()-s.valueOf())+"ms");
    }

  });
}
exports.CYCLE = CYCLE
