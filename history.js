'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initHistory;
function initHistory(contextHistory) {
  var history = contextHistory.timestamp().scan(function (acc, state) {
    acc.push(state);
    return acc;
  }, []).tap(function (_) {
    return console.log(_, 'history');
  }).multicast();
  var travel = contextHistory.travel;
  history.cursor = -1;
  history.travel = travel.sample(function (offset, states) {
    var cursor = offset(states.length + history.cursor);
    if (cursor < states.length && cursor >= 0) {
      history.cursor = offset(history.cursor);
      return states[cursor].value;
    }
  }, travel, history).filter(function (x) {
    return !!x;
  });
  history.forward = function () {
    travel.send(function (x) {
      return x + 1;
    });
  };
  history.backward = function () {
    travel.send(function (x) {
      return x - 1;
    });
  };
  return history;
}