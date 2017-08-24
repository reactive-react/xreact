`react-most` no more than creating stream from your actions, and bind it to state stream. no any other computations happen in `react-most`. so please refer to [most.js's perf](https://github.com/cujojs/most/tree/master/test/perf) which is realy Great!

I also do a simple benchmark with 8k times of performing counter increase action
```
Memory Usage Before: { rss: 32501760, heapTotal: 16486912, heapUsed: 11307128 }
Memory Usage After: { rss: 34418688, heapTotal: 18550784, heapUsed: 11932336 }
Elapsed 8ms
```
basically the same level of performance as redux(which is 10ms in the same testing)
