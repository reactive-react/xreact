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
exports.TxMixin = undefined;
exports.mixin = mixin;

var _events = require('events');

var _most = require('most');

var _most2 = _interopRequireDefault(_most);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _when = require('when');

var _when2 = _interopRequireDefault(_when);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function genUuid(reactClass) {
  reactClass.uuid = reactClass.uuid || _uuid2.default.v4();
  return reactClass.uuid;
}
var id = function id(_) {
  return _;
};
var unmount = 'mostux.unmount';
var unmountSymbol = Symbol(unmount);

var TxMixin = exports.TxMixin = {
  contextTypes: {
    mostuxChannel: _react2.default.PropTypes.object
  },
  bindActions: function bindActions(actions) {
    var _this = this;

    var imm = arguments.length <= 1 || arguments[1] === undefined ? id : arguments[1];
    var unimm = arguments.length <= 2 || arguments[2] === undefined ? id : arguments[2];

    var addToActionStream = id;
    var actionStream = _most2.default.create(function (add) {
      addToActionStream = add;
      return function dispose(e) {
        console.log('heheda', e);
      };
    });
    var unmountEvent = new _events.EventEmitter();
    this[unmountSymbol] = unmountEvent.emit.bind(null, unmount);
    var unmountStream = _most2.default.fromEvent(unmount, unmountEvent);

    var _loop = function _loop(name) {
      _this.context.mostuxChannel.on(genUuid(_this.constructor) + name, function (e) {
        return unimm(addToActionStream(function (prevState, props) {
          return actions[name].call(_this, e, imm(prevState), imm(props), actionStream, stateStream);
        }));
      });
    };

    for (var name in actions) {
      _loop(name);
    }
    var stateStream = actionStream.until(unmountStream).tap(function (action) {
      return _this.setState(action);
    }).map(function (_) {
      return _this.state;
    }).timestamp().observe(function (state) {
      console.debug(new Date(state.time).toLocaleTimeString() + ': state is ' + JSON.stringify(state.value));
    }).catch(function (e) {
      return console.error('mostux ERROR:' + e);
    });
    return stateStream;
  },
  unbindActions: function unbindActions() {
    this[unmountSymbol] && this[unmountSymbol]('unbind action');
  },
  componentWillUnmount: function componentWillUnmount() {
    this.unbindActions();
  },
  dispatch: function dispatch(where, how, what) {
    this.context.mostuxChannel.emit(genUuid(where) + how, what);
  }
};

function mixin(reactClass) {
  for (var _len = arguments.length, actions = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    actions[_key - 1] = arguments[_key];
  }

  reactClass.contextTypes = TxMixin.contextTypes;
  for (var name in TxMixin) {
    if (name != 'contextTypes') reactClass.prototype[name] = TxMixin[name];
  }
  var oldMountFunc = reactClass.prototype.componentDidMount;
  var oldUnmountFunc = reactClass.prototype.componentWillUnmount;
  reactClass.prototype.componentDidMount = function () {
    oldMountFunc && oldMountFunc.call(this);
    this.bindActions.apply(this, actions);
  };
  reactClass.prototype.componentWillUnmount = function () {
    oldUnmountFunc && oldUnmountFunc.call(this);
    this.unbindActions();
  };
  return reactClass;
}

var Mostux = _react2.default.createClass({
  childContextTypes: {
    mostuxChannel: _react2.default.PropTypes.object
  },
  getChildContext: function getChildContext() {
    return {
      mostuxChannel: new _events.EventEmitter()
    };
  },
  render: function render() {
    return _react2.default.createElement(
      'div',
      null,
      this.props.children
    );
  }
});

exports.default = Mostux;

