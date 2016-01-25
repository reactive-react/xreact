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

var _childContextTypes;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = connect;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _most = require('most');

var _most2 = _interopRequireDefault(_most);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// unfortunately React doesn't support symbol as context key yet, so let me just preteding using Symbol until react implement the Symbol version of Object.assign
var intentStream = "__reactive.react.intentStream__";
var addToIntentStream = "__reactive.react.addToIntentStream__";
var flatObserve = "__reactive.react.flatObserve__";

function observable(obj) {
  return !!obj.observe;
}

var id = function id(_) {
  return _;
};
function mostify() {
  var addToIntentStream = function addToIntentStream() {
    console.error('intent stream not binded');
  };
  var actionStream = _most2.default.create(function (add) {
    addToIntentStream = add;
    return function dispose(e) {
      addToIntentStream = id;
      console.log('action stream disposed');
    };
  });
  actionStream.drain();

  function flatObserve(actionsSinks, f) {
    return _most2.default.from(actionsSinks).join().observe(f);
  }
  return { actionStream: actionStream, addToIntentStream: addToIntentStream, flatObserve: flatObserve };
}

function connect(ReactClass, main, props) {
  var _Connect$contextTypes;

  var Connect = function (_React$Component) {
    _inherits(Connect, _React$Component);

    function Connect(props, context) {
      _classCallCheck(this, Connect);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Connect).call(this, props, context));

      _this.actions = {};
      var sinks = main(context[intentStream]);
      context[intentStream].timestamp().observe(function (stamp) {
        return console.log('[' + new Date(stamp.time).toLocaleTimeString() + '][INTENT]: ' + JSON.stringify(stamp.value));
      });
      var actionsSinks = [];

      var _loop = function _loop(name) {
        if (observable(sinks[name])) actionsSinks.push(sinks[name]);else if (sinks[name] instanceof Function) {
          _this.actions[name] = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return _this.context[addToIntentStream](sinks[name].apply(null, args));
          };
        }
      };

      for (var name in sinks) {
        _loop(name);
      }
      _this.context[flatObserve](actionsSinks, function (action) {
        if (action instanceof Function) _this.setState(function (prevState, props) {
          var newState = action.call(_this, prevState, props);
          return newState;
        });else console.warn('action', action, 'need to be a Functioin map from state to new state');
      });
      return _this;
    }

    _createClass(Connect, [{
      key: 'render',
      value: function render() {
        return _react2.default.createElement(ReactClass, _extends({}, this.props, this.state, { actions: this.actions }));
      }
    }]);

    return Connect;
  }(_react2.default.Component);

  Connect.contextTypes = (_Connect$contextTypes = {}, _defineProperty(_Connect$contextTypes, intentStream, _react2.default.PropTypes.object), _defineProperty(_Connect$contextTypes, addToIntentStream, _react2.default.PropTypes.func), _defineProperty(_Connect$contextTypes, flatObserve, _react2.default.PropTypes.func), _Connect$contextTypes);
  return Connect;
}

var Most = _react2.default.createClass({
  childContextTypes: (_childContextTypes = {}, _defineProperty(_childContextTypes, intentStream, _react2.default.PropTypes.object), _defineProperty(_childContextTypes, addToIntentStream, _react2.default.PropTypes.func), _defineProperty(_childContextTypes, flatObserve, _react2.default.PropTypes.func), _childContextTypes),
  getChildContext: function getChildContext() {
    var _ref;

    var driverClass = this.props && this.props.driver || mostify;
    var driver = driverClass();
    return _ref = {}, _defineProperty(_ref, intentStream, driver.actionStream), _defineProperty(_ref, addToIntentStream, driver.addToIntentStream), _defineProperty(_ref, flatObserve, driver.flatObserve), _ref;
  },
  render: function render() {
    return _react2.default.Children.only(this.props.children);
  }
});

exports.default = Most;

