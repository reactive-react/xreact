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
var React = require("react");
var prop_types_1 = require("prop-types");
var history_1 = require("./history");
var interfaces_1 = require("./interfaces");
var most_1 = require("most");
var most_2 = require("./engine/most");
// unfortunately React doesn't support symbol as context key yet, so let me just preteding using Symbol until react implement the Symbol version of Object.assign
exports.REACT_MOST_ENGINE = '@@reactive-react/react-most.engine';
var h = React.createElement;
var CONTEXT_TYPE = (_a = {},
    _a[exports.REACT_MOST_ENGINE] = prop_types_1.PropTypes.object,
    _a);
function isConnectClass(ComponentClass) {
    return ComponentClass.contextTypes == CONTEXT_TYPE;
}
function connect(main, opts) {
    if (opts === void 0) { opts = { history: false }; }
    return function (WrappedComponent) {
        var connectDisplayName = "Connect(" + getDisplayName(WrappedComponent) + ")";
        if (isConnectClass(WrappedComponent)) {
            return _a = (function (_super) {
                    __extends(ConnectNode, _super);
                    function ConnectNode(props, context) {
                        var _this = _super.call(this, props, context) || this;
                        var _a = main(context[exports.REACT_MOST_ENGINE].intentStream, props), actions = _a.actions, update$ = _a.update$;
                        _this.machine = {
                            update$: _this.machine.update$.merge(update$),
                            actions: Object.assign({}, bindActions(actions, context[exports.REACT_MOST_ENGINE].intentStream, _this), _this.machine.actions)
                        };
                        return _this;
                    }
                    return ConnectNode;
                }(WrappedComponent)),
                _a.contextTypes = CONTEXT_TYPE,
                _a.displayName = connectDisplayName,
                _a;
        }
        else {
            return _b = (function (_super) {
                    __extends(ConnectLeaf, _super);
                    function ConnectLeaf(props, context) {
                        var _this = _super.call(this, props, context) || this;
                        var engine = context[exports.REACT_MOST_ENGINE];
                        if (opts.history || props.history) {
                            _this.traveler = history_1.default(engine.historyStream, engine.travelStream);
                            _this.traveler.travel.forEach(function (state) {
                                return _this.setState(state);
                            });
                        }
                        var _a = main(engine.intentStream, props), actions = _a.actions, update$ = _a.update$;
                        _this.machine = {
                            actions: bindActions(actions, engine.intentStream, _this),
                            update$: update$
                        };
                        var defaultKey = Object.keys(WrappedComponent.defaultProps);
                        _this.state = Object.assign({}, WrappedComponent.defaultProps, pick(defaultKey, props));
                        return _this;
                    }
                    ConnectLeaf.prototype.componentWillReceiveProps = function (nextProps) {
                        this.setState(function (state) { return pick(Object.keys(state), nextProps); });
                    };
                    ConnectLeaf.prototype.componentDidMount = function () {
                        var _this = this;
                        this.subscription = this.context[exports.REACT_MOST_ENGINE].observe(this.machine.update$, function (action) {
                            if (action instanceof Function) {
                                _this.setState(function (prevState, props) {
                                    var newState = action.call(_this, prevState, props);
                                    if ((opts.history || props.history) && newState != prevState) {
                                        _this.traveler.cursor = -1;
                                        _this.context[exports.REACT_MOST_ENGINE].historyStream.send(prevState);
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
                        this.subscription.unsubscribe();
                    };
                    ConnectLeaf.prototype.render = function () {
                        return h(WrappedComponent, Object.assign({}, opts, this.props, this.state, {
                            actions: this.machine.actions,
                            traveler: this.traveler
                        }));
                    };
                    return ConnectLeaf;
                }(interfaces_1.Connect)),
                _b.contextTypes = CONTEXT_TYPE,
                _b.displayName = connectDisplayName,
                _b;
        }
        var _a, _b;
    };
}
exports.connect = connect;
var Most = (function (_super) {
    __extends(Most, _super);
    function Most() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Most.prototype.getChildContext = function () {
        var engine = (this.props && this.props.engine && new this.props.engine()) || new most_2.Engine();
        /* istanbul ignore if */
        if (process.env.NODE_ENV === 'debug') {
            inspect(engine);
        }
        return _a = {},
            _a[exports.REACT_MOST_ENGINE] = engine,
            _a;
        var _a;
    };
    Most.prototype.render = function () {
        return React.Children.only(this.props.children);
    };
    return Most;
}(React.PureComponent));
Most.childContextTypes = CONTEXT_TYPE;
exports.default = Most;
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
function bindActions(actions, intent$, self) {
    var _actions = {
        fromEvent: function (e, f) {
            if (f === void 0) { f = function (x) { return x; }; }
            return intent$.send(f(e));
        },
        fromPromise: function (p) {
            return p.then(function (x) { return intent$.send(x); });
        },
    };
    var _loop_1 = function (a) {
        _actions[a] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return intent$.send(actions[a].apply(self, args));
        };
    };
    for (var a in actions) {
        _loop_1(a);
    }
    return _actions;
}
function pick(names, obj) {
    var result = {};
    for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
        var name_1 = names_1[_i];
        if (obj[name_1])
            result[name_1] = obj[name_1];
    }
    return result;
}
function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
var _a;
