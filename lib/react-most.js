"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var prop_types_1 = require("prop-types");
var history_1 = require("./history");
var most_1 = require("most");
var most_2 = require("./engine/most");
// unfortunately React doesn't support symbol as context key yet, so let me just preteding using Symbol until react implement the Symbol version of Object.assign
exports.INTENT_STREAM = '@@reactive-react/react-most.intentStream';
exports.HISTORY_STREAM = '@@reactive-react/react-most.historyStream';
var MERGE_OBSERVE = '@@reactive-react/react-most.mergeObserve';
var CONTEXT_TYPE = (_a = {},
    _a[exports.INTENT_STREAM] = prop_types_1.default.object,
    _a[exports.HISTORY_STREAM] = prop_types_1.default.object,
    _a[MERGE_OBSERVE] = prop_types_1.default.func,
    _a);
var h = react_1.default.createElement;
function connect(main, opts) {
    if (opts === void 0) { opts = { history: false }; }
    return function (WrappedComponent) {
        var connectDisplayName = "Connect(" + getDisplayName(WrappedComponent) + ")";
        if (WrappedComponent.contextTypes === CONTEXT_TYPE) {
            return _a = (function (_super) {
                    __extends(ConnectNode, _super);
                    function ConnectNode(props, context) {
                        var _this = _super.call(this, props, context) || this;
                        var _a = main(context[exports.INTENT_STREAM], props), actions = _a.actions, sink$ = _a.sink$;
                        _this.sink$ = sink$;
                        _this.actions = Object.assign({}, actions, props.actions);
                        return _this;
                    }
                    ConnectNode.prototype.render = function () {
                        return h(WrappedComponent, Object.assign({}, this.props, opts, {
                            sink$: this.sink$,
                            actions: this.actions,
                        }));
                    };
                    return ConnectNode;
                }(react_1.default.PureComponent)),
                _a.contextTypes = CONTEXT_TYPE,
                _a.displayName = connectDisplayName,
                _a;
        }
        else {
            var ConnectLeaf = (function (_super) {
                __extends(ConnectLeaf, _super);
                function ConnectLeaf(props, context) {
                    var _this = _super.call(this, props, context) || this;
                    if (opts.history || props.history) {
                        opts.history = history_1.default(context[exports.HISTORY_STREAM]);
                        opts.history.travel.forEach(function (state) {
                            return _this.setState(state);
                        });
                    }
                    var _a = actionsAndSinks(main(context[exports.INTENT_STREAM], props), _this), actions = _a[0], sink$ = _a[1];
                    _this.sink$ = sink$.concat(props.sink$ || []);
                    _this.actions = Object.assign({}, actions, props.actions);
                    var defaultKey = Object.keys(WrappedComponent.defaultProps);
                    _this.state = Object.assign({}, WrappedComponent.defaultProps, pick(defaultKey, props));
                    return _this;
                }
                ConnectLeaf.prototype.componentWillReceiveProps = function (nextProps) {
                    this.setState(function (state) { return pick(Object.keys(state), nextProps); });
                };
                ConnectLeaf.prototype.componentDidMount = function () {
                    var _this = this;
                    this.subscriptions = this.context[MERGE_OBSERVE](this.sink$, function (action) {
                        if (action instanceof Function) {
                            _this.setState(function (prevState, props) {
                                var newState = action.call(_this, prevState, props);
                                if (opts.history && newState != prevState) {
                                    opts.history.cursor = -1;
                                    _this.context[exports.HISTORY_STREAM].send(prevState);
                                }
                                return newState;
                            });
                        }
                        else {
                            /* istanbul ignore next */
                            console.warn('action', action, 'need to be a Function which map from current state to new state');
                        }
                    });
                };
                ConnectLeaf.prototype.componentWillUnmount = function () {
                    this.subscriptions.unsubscribe();
                };
                ConnectLeaf.prototype.render = function () {
                    return h(WrappedComponent, Object.assign({}, this.props, this.state, opts, {
                        actions: this.actions,
                    }));
                };
                return ConnectLeaf;
            }(react_1.default.PureComponent));
            Connect.contextTypes = CONTEXT_TYPE;
            Connect.displayName = connectDisplayName;
            return Connect;
        }
        var _a;
    };
}
var Most = (function (_super) {
    __extends(Most, _super);
    function Most() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Most.prototype.getChildContext = function () {
        var engineClass = (this.props && this.props.engine) || most_2.default;
        var engine = engineClass();
        /* istanbul ignore if */
        if (process.env.NODE_ENV === 'debug') {
            inspect(engine);
        }
        return _a = {},
            _a[exports.INTENT_STREAM] = engine.intentStream,
            _a[MERGE_OBSERVE] = engine.mergeObserve,
            _a[exports.HISTORY_STREAM] = engine.historyStream,
            _a;
        var _a;
    };
    Most.prototype.render = function () {
        return react_1.default.Children.only(this.props.children);
    };
    return Most;
}(react_1.default.PureComponent));
exports.default = Most;
Most.childContextTypes = CONTEXT_TYPE;
function observable(obj) {
    return !!obj.subscribe;
}
/* istanbul ignore next */
function inspect(engine) {
    most_1.from(engine.intentStream)
        .timestamp()
        .observe(function (stamp) {
        return console.log("[" + new Date(stamp.time).toJSON() + "][INTENT]:}", stamp.value);
    });
    most_1.from(engine.historyStream)
        .timestamp()
        .observe(function (stamp) {
        return console.log("[" + new Date(stamp.time).toJSON() + "][STATE]:}", stamp.value);
    });
}
function actionsAndSinks(sinks, self) {
    var _sinks = [];
    var _actions = {
        fromEvent: function (e, f) {
            if (f === void 0) { f = function (x) { return x; }; }
            return self.context[exports.INTENT_STREAM].send(f(e));
        },
        fromPromise: function (p) {
            return p.then(function (x) { return self.context[exports.INTENT_STREAM].send(x); });
        },
    };
    var _loop_1 = function (name) {
        var value = sinks[name];
        if (observable(value)) {
            _sinks.push(value);
        }
        else if (value instanceof Function) {
            _actions[name] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return self.context[exports.INTENT_STREAM].send(value.apply(self, args));
            };
        }
        else if (name === 'actions') {
            var _loop_2 = function (a) {
                _actions[a] = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return self.context[exports.INTENT_STREAM].send(value[a].apply(self, args));
                };
            };
            for (var a in value) {
                _loop_2(a);
            }
        }
    };
    for (var name in sinks) {
        _loop_1(name);
    }
    return [_actions, _sinks];
}
function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
var _a;
