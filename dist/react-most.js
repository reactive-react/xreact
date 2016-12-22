(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Most = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Engine;

var _most = require('most');

var _mostSubject = require('most-subject');

function Engine() {
  var intentStream = (0, _mostSubject.async)(),
      historyStream = (0, _mostSubject.async)(),
      travelStream = (0, _mostSubject.async)();
  intentStream.send = intentStream.next.bind(intentStream);
  historyStream.send = historyStream.next.bind(historyStream);
  travelStream.send = travelStream.next.bind(travelStream);

  function mergeObserve(actionsSinks, f) {
    var subscriptions = (0, _most.mergeArray)(actionsSinks).recoverWith(function (e) {
      console.error('There is Error in your reducer:', e, e.stack);
      return (0, _most.of)(function (x) {
        return x;
      });
    }).subscribe({
      next: f,
      error: function error(e) {
        return console.error('Something is Wrong:', e, e.stack);
      }
    });
    return subscriptions;
  }
  historyStream.travel = travelStream;
  return { intentStream: intentStream, mergeObserve: mergeObserve, historyStream: historyStream };
}
},{"most":"most","most-subject":"most-subject"}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initHistory;

var _most = require('most');

function initHistory(contextHistory) {
  var history = (0, _most.from)(contextHistory).timestamp().scan(function (acc, state) {
    acc.push(state);
    return acc;
  }, []).multicast();
  var travel = contextHistory.travel;
  history.cursor = -1;
  history.travel = (0, _most.from)(travel).sample(function (offset, states) {
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
},{"most":"most"}],3:[function(require,module,exports){
var _objectAssign = require('./_objectAssign');

module.exports =
  typeof Object.assign === 'function' ? Object.assign : _objectAssign;

},{"./_objectAssign":9}],4:[function(require,module,exports){
var _isPlaceholder = require('./_isPlaceholder');


/**
 * Optimized internal one-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
module.exports = function _curry1(fn) {
  return function f1(a) {
    if (arguments.length === 0 || _isPlaceholder(a)) {
      return f1;
    } else {
      return fn.apply(this, arguments);
    }
  };
};

},{"./_isPlaceholder":8}],5:[function(require,module,exports){
var _curry1 = require('./_curry1');
var _isPlaceholder = require('./_isPlaceholder');


/**
 * Optimized internal two-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
module.exports = function _curry2(fn) {
  return function f2(a, b) {
    switch (arguments.length) {
      case 0:
        return f2;
      case 1:
        return _isPlaceholder(a) ? f2
             : _curry1(function(_b) { return fn(a, _b); });
      default:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f2
             : _isPlaceholder(a) ? _curry1(function(_a) { return fn(_a, b); })
             : _isPlaceholder(b) ? _curry1(function(_b) { return fn(a, _b); })
             : fn(a, b);
    }
  };
};

},{"./_curry1":4,"./_isPlaceholder":8}],6:[function(require,module,exports){
module.exports = function _has(prop, obj) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

},{}],7:[function(require,module,exports){
var _has = require('./_has');


module.exports = (function() {
  var toString = Object.prototype.toString;
  return toString.call(arguments) === '[object Arguments]' ?
    function _isArguments(x) { return toString.call(x) === '[object Arguments]'; } :
    function _isArguments(x) { return _has('callee', x); };
}());

},{"./_has":6}],8:[function(require,module,exports){
module.exports = function _isPlaceholder(a) {
  return a != null &&
         typeof a === 'object' &&
         a['@@functional/placeholder'] === true;
};

},{}],9:[function(require,module,exports){
var _has = require('./_has');

// Based on https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
module.exports = function _objectAssign(target) {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  var output = Object(target);
  var idx = 1;
  var length = arguments.length;
  while (idx < length) {
    var source = arguments[idx];
    if (source != null) {
      for (var nextKey in source) {
        if (_has(nextKey, source)) {
          output[nextKey] = source[nextKey];
        }
      }
    }
    idx += 1;
  }
  return output;
};

},{"./_has":6}],10:[function(require,module,exports){
var _curry1 = require('./internal/_curry1');
var _has = require('./internal/_has');
var _isArguments = require('./internal/_isArguments');


/**
 * Returns a list containing the names of all the enumerable own properties of
 * the supplied object.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> [k]
 * @param {Object} obj The object to extract properties from
 * @return {Array} An array of the object's own properties.
 * @example
 *
 *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
 */
module.exports = (function() {
  // cover IE < 9 keys issues
  var hasEnumBug = !({toString: null}).propertyIsEnumerable('toString');
  var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString',
                            'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];
  // Safari bug
  var hasArgsEnumBug = (function() {
    'use strict';
    return arguments.propertyIsEnumerable('length');
  }());

  var contains = function contains(list, item) {
    var idx = 0;
    while (idx < list.length) {
      if (list[idx] === item) {
        return true;
      }
      idx += 1;
    }
    return false;
  };

  return typeof Object.keys === 'function' && !hasArgsEnumBug ?
    _curry1(function keys(obj) {
      return Object(obj) !== obj ? [] : Object.keys(obj);
    }) :
    _curry1(function keys(obj) {
      if (Object(obj) !== obj) {
        return [];
      }
      var prop, nIdx;
      var ks = [];
      var checkArgsLength = hasArgsEnumBug && _isArguments(obj);
      for (prop in obj) {
        if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
          ks[ks.length] = prop;
        }
      }
      if (hasEnumBug) {
        nIdx = nonEnumerableProps.length - 1;
        while (nIdx >= 0) {
          prop = nonEnumerableProps[nIdx];
          if (_has(prop, obj) && !contains(ks, prop)) {
            ks[ks.length] = prop;
          }
          nIdx -= 1;
        }
      }
      return ks;
    });
}());

},{"./internal/_curry1":4,"./internal/_has":6,"./internal/_isArguments":7}],11:[function(require,module,exports){
var _assign = require('./internal/_assign');
var _curry1 = require('./internal/_curry1');


/**
 * Merges a list of objects together into one object.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category List
 * @sig [{k: v}] -> {k: v}
 * @param {Array} list An array of objects
 * @return {Object} A merged object.
 * @see R.reduce
 * @example
 *
 *      R.mergeAll([{foo:1},{bar:2},{baz:3}]); //=> {foo:1,bar:2,baz:3}
 *      R.mergeAll([{foo:1},{foo:2},{bar:2}]); //=> {foo:2,bar:2}
 */
module.exports = _curry1(function mergeAll(list) {
  return _assign.apply(null, [{}].concat(list));
});

},{"./internal/_assign":3,"./internal/_curry1":4}],12:[function(require,module,exports){
var _curry2 = require('./internal/_curry2');


/**
 * Returns a partial copy of an object containing only the keys specified. If
 * the key does not exist, the property is ignored.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig [k] -> {k: v} -> {k: v}
 * @param {Array} names an array of String property names to copy onto a new object
 * @param {Object} obj The object to copy from
 * @return {Object} A new object with only properties from `names` on it.
 * @see R.omit, R.props
 * @example
 *
 *      R.pick(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
 *      R.pick(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1}
 */
module.exports = _curry2(function pick(names, obj) {
  var result = {};
  var idx = 0;
  while (idx < names.length) {
    if (names[idx] in obj) {
      result[names[idx]] = obj[names[idx]];
    }
    idx += 1;
  }
  return result;
});

},{"./internal/_curry2":5}],13:[function(require,module,exports){
(function (process){
/**
The MIT License (MIT)

Copyright (c) 2015 Jichao Ouyang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HISTORY_STREAM = exports.INTENT_STREAM = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _CONTEXT_TYPE;

exports.connect = connect;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _history = require('./history');

var _history2 = _interopRequireDefault(_history);

var _most = require('most');

var _most2 = require('./engine/most');

var _most3 = _interopRequireDefault(_most2);

var _mergeAll = require('ramda/src/mergeAll');

var _mergeAll2 = _interopRequireDefault(_mergeAll);

var _pick = require('ramda/src/pick');

var _pick2 = _interopRequireDefault(_pick);

var _keys = require('ramda/src/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// unfortunately React doesn't support symbol as context key yet, so let me just preteding using Symbol until react implement the Symbol version of Object.assign
var INTENT_STREAM = exports.INTENT_STREAM = "@@reactive-react/react-most.intentStream";
var HISTORY_STREAM = exports.HISTORY_STREAM = "@@reactive-react/react-most.historyStream";
var MERGE_OBSERVE = "@@reactive-react/react-most.mergeObserve";

var CONTEXT_TYPE = (_CONTEXT_TYPE = {}, _defineProperty(_CONTEXT_TYPE, INTENT_STREAM, _react2.default.PropTypes.object), _defineProperty(_CONTEXT_TYPE, HISTORY_STREAM, _react2.default.PropTypes.object), _defineProperty(_CONTEXT_TYPE, MERGE_OBSERVE, _react2.default.PropTypes.func), _CONTEXT_TYPE);

function connect(main) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return function (WrappedComponent) {
    var connectDisplayName = 'Connect(' + getDisplayName(WrappedComponent) + ')';
    if (WrappedComponent.contextTypes === CONTEXT_TYPE) {
      var Connect = function (_React$PureComponent) {
        _inherits(Connect, _React$PureComponent);

        function Connect(props, context) {
          _classCallCheck(this, Connect);

          var _this = _possibleConstructorReturn(this, (Connect.__proto__ || Object.getPrototypeOf(Connect)).call(this, props, context));

          var _actionsAndSinks = actionsAndSinks(main(context[INTENT_STREAM], props), _this),
              _actionsAndSinks2 = _slicedToArray(_actionsAndSinks, 2),
              actions = _actionsAndSinks2[0],
              sink$ = _actionsAndSinks2[1];

          _this.sink$ = sink$.concat(props.sink$ || []);
          _this.actions = (0, _mergeAll2.default)([actions, props.actions]);
          return _this;
        }

        _createClass(Connect, [{
          key: 'render',
          value: function render() {
            return _react2.default.createElement(WrappedComponent, _extends({}, this.props, opts, { sink$: this.sink$, actions: this.actions }));
          }
        }]);

        return Connect;
      }(_react2.default.PureComponent);

      Connect.contextTypes = CONTEXT_TYPE;
      Connect.displayName = connectDisplayName;
      return Connect;
    } else {
      var _Connect = function (_React$PureComponent2) {
        _inherits(_Connect, _React$PureComponent2);

        function _Connect(props, context) {
          _classCallCheck(this, _Connect);

          var _this2 = _possibleConstructorReturn(this, (_Connect.__proto__ || Object.getPrototypeOf(_Connect)).call(this, props, context));

          if (opts.history || props.history) {
            opts.history = (0, _history2.default)(context[HISTORY_STREAM]);
            opts.history.travel.forEach(function (state) {
              return _this2.setState(state);
            });
          }

          var _actionsAndSinks3 = actionsAndSinks(main(context[INTENT_STREAM], props), _this2),
              _actionsAndSinks4 = _slicedToArray(_actionsAndSinks3, 2),
              actions = _actionsAndSinks4[0],
              sink$ = _actionsAndSinks4[1];

          _this2.sink$ = sink$.concat(props.sink$ || []);
          _this2.actions = (0, _mergeAll2.default)([actions, props.actions]);
          var defaultKey = (0, _keys2.default)(WrappedComponent.defaultProps);
          _this2.state = (0, _mergeAll2.default)([WrappedComponent.defaultProps, (0, _pick2.default)(defaultKey, props)]);
          return _this2;
        }

        _createClass(_Connect, [{
          key: 'componentWillReceiveProps',
          value: function componentWillReceiveProps(nextProps) {
            this.setState(function (state) {
              return (0, _pick2.default)((0, _keys2.default)(state), nextProps);
            });
          }
        }, {
          key: 'componentDidMount',
          value: function componentDidMount() {
            var _this3 = this;

            this.subscriptions = this.context[MERGE_OBSERVE](this.sink$, function (action) {
              if (action instanceof Function) {
                _this3.setState(function (prevState, props) {
                  var newState = action.call(_this3, prevState, props);
                  if (opts.history && newState != prevState) {
                    opts.history.cursor = -1;
                    _this3.context[HISTORY_STREAM].send(prevState);
                  }
                  return newState;
                });
              } else {
                /* istanbul ignore next */
                console.warn('action', action, 'need to be a Function which map from current state to new state');
              }
            });
          }
        }, {
          key: 'componentWillUnmount',
          value: function componentWillUnmount() {
            this.subscriptions.unsubscribe();
          }
        }, {
          key: 'render',
          value: function render() {
            return _react2.default.createElement(WrappedComponent, _extends({}, this.props, this.state, opts, { actions: this.actions }));
          }
        }]);

        return _Connect;
      }(_react2.default.PureComponent);

      _Connect.contextTypes = CONTEXT_TYPE;
      _Connect.displayName = connectDisplayName;
      return _Connect;
    }
  };
}

var Most = _react2.default.createClass({
  childContextTypes: CONTEXT_TYPE,
  getChildContext: function getChildContext() {
    var _ref;

    var engineClass = this.props && this.props.engine || _most3.default;
    var engine = engineClass();
    /* istanbul ignore if */
    if (process.env.NODE_ENV === 'debug') {
      inspect(engine);
    }
    return _ref = {}, _defineProperty(_ref, INTENT_STREAM, engine.intentStream), _defineProperty(_ref, MERGE_OBSERVE, engine.mergeObserve), _defineProperty(_ref, HISTORY_STREAM, engine.historyStream), _ref;
  },
  render: function render() {
    return _react2.default.Children.only(this.props.children);
  }
});

exports.default = Most;


function observable(obj) {
  return !!obj.subscribe;
}

/* istanbul ignore next */
function inspect(engine) {
  (0, _most.from)(engine.intentStream).timestamp().observe(function (stamp) {
    return console.log('[' + new Date(stamp.time).toJSON() + '][INTENT]:}', stamp.value);
  });
  (0, _most.from)(engine.historyStream).timestamp().observe(function (stamp) {
    return console.log('[' + new Date(stamp.time).toJSON() + '][STATE]:}', stamp.value);
  });
}

function actionsAndSinks(sinks, self) {
  var _sinks = [];
  var _actions = {
    fromEvent: function fromEvent(e) {
      var f = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (x) {
        return x;
      };

      self.context[INTENT_STREAM].send(f(e));
    },
    fromPromise: function fromPromise(p) {
      p.then(function (x) {
        return self.context[INTENT_STREAM].send(x);
      });
    }
  };

  var _loop = function _loop(name) {
    var value = sinks[name];
    if (observable(value)) {
      _sinks.push(value);
    } else if (value instanceof Function) {
      _actions[name] = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return self.context[INTENT_STREAM].send(value.apply(self, args));
      };
    } else if (name === 'actions') {
      var _loop2 = function _loop2(a) {
        _actions[a] = function () {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          return self.context[INTENT_STREAM].send(value[a].apply(self, args));
        };
      };

      for (var a in value) {
        _loop2(a);
      }
    }
  };

  for (var name in sinks) {
    _loop(name);
  }
  return [_actions, _sinks];
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
}).call(this,require('_process'))
},{"./engine/most":1,"./history":2,"_process":14,"most":"most","ramda/src/keys":10,"ramda/src/mergeAll":11,"ramda/src/pick":12,"react":"react"}],14:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[13])(13)
});