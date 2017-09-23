(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.xreact = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../xs/index");
var x_1 = require("../x");
var state_1 = require("./state");
function isSemigroup(a) {
    return a && typeof a.concat == 'function';
}
var FantasyX = /** @class */ (function () {
    function FantasyX(plan) {
        this.plan = plan;
    }
    FantasyX.prototype.apply = function (WrappedComponent) {
        return x_1.x(this.patch().runS())(WrappedComponent);
    };
    FantasyX.prototype.runS = function () {
        var _this = this;
        return function (intent$) {
            var machine = _this.plan(intent$);
            var update$ = index_1.streamOps.map(function (s) { return s.runS.bind(s); }, machine.update$);
            return { update$: update$, actions: machine.actions };
        };
    };
    FantasyX.prototype.map = function (f) {
        var _this = this;
        return new FantasyX(function (intent$) {
            var machine = _this.plan(intent$);
            var update$ = index_1.streamOps.map(function (state) { return state.map(f); }, machine.update$);
            return { update$: update$, actions: machine.actions };
        });
    };
    FantasyX.prototype.fold = function (f, base) {
        var _this = this;
        return new FantasyX(function (intent$) {
            var machine = _this.plan(intent$);
            var update$ = index_1.streamOps.merge(index_1.streamOps.just(state_1.State.pure(base)), index_1.streamOps.scan(function (accS, curS) {
                return accS.chain(function (acc) {
                    return curS.chain(function (cur) {
                        return state_1.State.pure(f(acc, cur));
                    });
                });
            }, state_1.State.pure(base), machine.update$));
            return { update$: update$, actions: machine.actions };
        });
    };
    FantasyX.prototype.combine = function (f, fB) {
        var _this = this;
        return new FantasyX(function (intent$) {
            var machineB = fB.plan(intent$), machineA = _this.plan(intent$);
            var update$ = index_1.streamOps.combine(function (S1, S2) {
                return S1.chain(function (s1) {
                    return S2.chain(function (s2) {
                        return state_1.State.pure(f(s1, s2));
                    });
                });
            }, machineA.update$, machineB.update$);
            var actions = Object.assign({}, machineA.actions, machineB.actions);
            return { update$: update$, actions: actions };
        });
    };
    FantasyX.prototype.patch = function (f) {
        var _this = this;
        if (f === void 0) { f = function (_) { return _; }; }
        return new FantasyX(function (intent$) {
            var machine = _this.plan(intent$);
            var update$ = index_1.streamOps.map(function (state) { return state.patch(f); }, machine.update$);
            return { update$: update$, actions: machine.actions };
        });
    };
    FantasyX.prototype.bimap = function (fa, fb) {
        var _this = this;
        return new FantasyX(function (intent$) {
            var machine = _this.plan(intent$);
            var update$ = index_1.streamOps.map(function (state) { return state.map(fb); }, machine.update$);
            return { update$: update$, actions: fa(machine.actions) };
        });
    };
    FantasyX.prototype.combine3 = function (f, planB, planC) {
        var _this = this;
        return new FantasyX(function (intent$) {
            var machineB = planB.plan(intent$), machineA = _this.plan(intent$), machineC = planC.plan(intent$);
            var update$ = index_1.streamOps.combine(function (S1, S2, S3) {
                return S1.chain(function (s1) {
                    return S2.chain(function (s2) {
                        return S3.chain(function (s3) {
                            return state_1.State.pure(f(s1, s2, s3));
                        });
                    });
                });
            }, machineA.update$, machineB.update$, machineC.update$);
            var actions = Object.assign({}, machineA.actions, machineB.actions, machineC.actions);
            return { update$: update$, actions: actions };
        });
    };
    FantasyX.prototype.combine4 = function (f, planB, planC, planD) {
        var _this = this;
        return new FantasyX(function (intent$) {
            var machineB = planB.plan(intent$), machineA = _this.plan(intent$), machineC = planC.plan(intent$), machineD = planD.plan(intent$);
            var update$ = index_1.streamOps.combine(function (S1, S2, S3, S4) {
                return S1.chain(function (s1) {
                    return S2.chain(function (s2) {
                        return S3.chain(function (s3) {
                            return S4.chain(function (s4) {
                                return state_1.State.pure(f(s1, s2, s3, s4));
                            });
                        });
                    });
                });
            }, machineA.update$, machineB.update$, machineC.update$, machineD.update$);
            var actions = Object.assign({}, machineA.actions, machineB.actions, machineC.actions, machineD.actions);
            return { update$: update$, actions: actions };
        });
    };
    FantasyX.prototype.combine5 = function (f, planB, planC, planD, planE) {
        var _this = this;
        return new FantasyX(function (intent$) {
            var machineB = planB.plan(intent$), machineA = _this.plan(intent$), machineC = planC.plan(intent$), machineD = planD.plan(intent$), machineE = planE.plan(intent$);
            var update$ = index_1.streamOps.combine(function (S1, S2, S3, S4, S5) {
                return S1.chain(function (s1) {
                    return S2.chain(function (s2) {
                        return S3.chain(function (s3) {
                            return S4.chain(function (s4) {
                                return S5.chain(function (s5) {
                                    return state_1.State.pure(f(s1, s2, s3, s4, s5));
                                });
                            });
                        });
                    });
                });
            }, machineA.update$, machineB.update$, machineC.update$, machineD.update$, machineE.update$);
            var actions = Object.assign({}, machineA.actions, machineB.actions, machineC.actions, machineD.actions, machineE.actions);
            return { update$: update$, actions: actions };
        });
    };
    FantasyX.prototype.concat = function (fa) {
        return this.combine(function (a, b) {
            if (isSemigroup(a) && isSemigroup(b))
                return a.concat(b);
            else
                return b;
        }, fa);
    };
    FantasyX.prototype.merge = function (fa) {
        var _this = this;
        return new FantasyX(function (intent$) {
            var machineA = _this.plan(intent$);
            var machineB = fa.plan(intent$);
            var update$ = index_1.streamOps.merge(machineA.update$, machineB.update$);
            return { update$: update$, actions: Object.assign({}, machineA.actions, machineB.actions) };
        });
    };
    return FantasyX;
}());
exports.FantasyX = FantasyX;

},{"../x":7,"../xs/index":"/lib/xs/index.js","./state":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xs_1 = require("../xs");
var fantasyx_1 = require("./fantasyx");
var state_1 = require("./state");
function fromPlan(plan) {
    return new fantasyx_1.FantasyX(function (intent$) {
        var _a = plan(intent$), update$ = _a.update$, actions = _a.actions;
        return {
            actions: actions,
            update$: xs_1.streamOps.map(function (f) { return state_1.State.modify(f); }, update$)
        };
    });
}
exports.fromPlan = fromPlan;
function fromEvent(type, name, defaultVal) {
    return new fantasyx_1.FantasyX(function (intent$) {
        return {
            update$: xs_1.streamOps.merge(typeof defaultVal != 'undefined' ? xs_1.streamOps.just(state_1.State.pure(defaultVal)) : xs_1.streamOps.empty(), xs_1.streamOps.map(function (e) { return state_1.State.pure(e.target.value); }, xs_1.streamOps.filter(function (i) {
                var target = i.target;
                return target.tagName == 'INPUT' && target.name == name;
            }, intent$)))
        };
    });
}
exports.fromEvent = fromEvent;
function pure(a) {
    return new fantasyx_1.FantasyX(function (intent$) {
        return {
            update$: xs_1.streamOps.just(state_1.State.pure(a))
        };
    });
}
exports.pure = pure;
function empty() {
    return new fantasyx_1.FantasyX(function (intent$) {
        return {
            update$: xs_1.streamOps.empty()
        };
    });
}
exports.empty = empty;
function map(f, fa) {
    return fa.map(f);
}
exports.map = map;
function traverse(f, xs) {
    return xs.reduce(function (acc, i, index) { return acc.concat(f(i, index).map(function (x) { return [x]; })); }, pure([]));
}
exports.traverse = traverse;
function fold(f, base, fa) {
    return fa.fold(f, base);
}
exports.fold = fold;
function lift(f) {
    return function (fa) { return fa.map(f); };
}
exports.lift = lift;
function lift2(f) {
    return function (fa1, fa2) { return fa1.combine(f, fa2); };
}
exports.lift2 = lift2;
function lift3(f) {
    return function (fa1, fa2, fa3) { return fa1.combine3(f, fa2, fa3); };
}
exports.lift3 = lift3;
function lift4(f) {
    return function (fa1, fa2, fa3, fa4) { return fa1.combine4(f, fa2, fa3, fa4); };
}
exports.lift4 = lift4;
function lift5(f) {
    return function (fa1, fa2, fa3, fa4, fa5) { return fa1.combine5(f, fa2, fa3, fa4, fa5); };
}
exports.lift5 = lift5;
function concat(fa, fb) {
    return fa.concat(fb);
}
exports.concat = concat;
function merge(fa, fb) {
    return fa.merge(fb);
}
exports.merge = merge;

},{"../xs":"/lib/xs","./fantasyx":1,"./state":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var State = /** @class */ (function () {
    function State(runState) {
        this.runState = runState;
    }
    State.pure = function (a) {
        return new State(function (s) { return ({ s: s, a: a }); });
    };
    State.prototype.chain = function (f) {
        var _this = this;
        return new State(function (state) {
            var _a = _this.runState(state), a = _a.a, s = _a.s;
            return f(a).runState(s);
        });
    };
    State.prototype.runA = function (state) {
        return this.runState(state).a;
    };
    State.prototype.runS = function (state) {
        return this.runState(state).s;
    };
    State.prototype.map = function (f) {
        var _this = this;
        return new State(function (state) {
            var _a = _this.runState(state), a = _a.a, s = _a.s;
            return { a: f(a), s: s };
        });
    };
    State.get = function () {
        return new State(function (s) { return ({ s: s, a: s }); });
    };
    State.put = function (s) {
        return new State(function (_) { return ({ a: undefined, s: s }); });
    };
    State.modify = function (f) {
        return new State(function (s) { return ({ a: undefined, s: Object.assign({}, s, f(s)) }); });
    };
    State.prototype.patch = function (f) {
        var _this = this;
        return new State(function (state) {
            var _a = _this.runState(state), a = _a.a, s = _a.s;
            return {
                a: undefined, s: Object.assign({}, s, f(a, s))
            };
        });
    };
    return State;
}());
exports.State = State;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xs_1 = require("../xs");
var __1 = require("..");
function xinput(name) {
    return __1.fromPlan(function (intent$) {
        return {
            update$: xs_1.streamOps.map(function (value) { return (function (state) {
                var result = {};
                result[name] = value;
                return result;
            }); }, xs_1.streamOps.map(function (e) { return e.target.value; }, xs_1.streamOps.filter(function (i) {
                var target = i.target;
                return target.tagName == 'INPUT' && target.name == name;
            }, intent$)))
        };
    });
}
exports.xinput = xinput;

},{"..":5,"../xs":"/lib/xs"}],5:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./x"));
__export(require("./interfaces"));
__export(require("./xclass"));
__export(require("./fantasy"));
__export(require("./forms"));
__export(require("./xs"));

},{"./fantasy":2,"./forms":4,"./interfaces":6,"./x":7,"./xclass":8,"./xs":"/lib/xs"}],6:[function(require,module,exports){
(function (global){
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
var React = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);
exports.XREACT_ENGINE = '@reactive-react/xreact.engine';
var Xcomponent = /** @class */ (function (_super) {
    __extends(Xcomponent, _super);
    function Xcomponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Xcomponent;
}(React.PureComponent));
exports.Xcomponent = Xcomponent;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
(function (global){
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
var React = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);
var xclass_1 = require("./xclass");
var xs_1 = require("./xs");
var interfaces_1 = require("./interfaces");
exports.XREACT_ENGINE = interfaces_1.XREACT_ENGINE;
function isXcomponentClass(ComponentClass) {
    return ComponentClass.contextTypes == xclass_1.CONTEXT_TYPE;
}
exports.isXcomponentClass = isXcomponentClass;
function x(main, opts) {
    if (opts === void 0) { opts = {}; }
    return function (WrappedComponent) {
        if (isXcomponentClass(WrappedComponent)) {
            return xclass_1.extendXComponentClass(WrappedComponent, main);
        }
        else {
            return xclass_1.genXComponentClass(WrappedComponent, main, opts);
        }
    };
}
exports.x = x;
var X = /** @class */ (function (_super) {
    __extends(X, _super);
    function X() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    X.prototype.getChildContext = function () {
        var XClass = this.props.x;
        return _a = {},
            _a[interfaces_1.XREACT_ENGINE] = {
                intent$: xs_1.streamOps.subject(),
                history$: xs_1.streamOps.subject()
            },
            _a;
        var _a;
    };
    X.prototype.render = function () {
        return React.Children.only(this.props.children);
    };
    X.childContextTypes = xclass_1.CONTEXT_TYPE;
    return X;
}(React.PureComponent));
exports.X = X;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./interfaces":6,"./xclass":8,"./xs":"/lib/xs"}],8:[function(require,module,exports){
(function (process,global){
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
var react_1 = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);
var prop_types_1 = require("prop-types");
var interfaces_1 = require("./interfaces");
var xs_1 = require("./xs");
exports.CONTEXT_TYPE = (_a = {},
    _a[interfaces_1.XREACT_ENGINE] = prop_types_1.PropTypes.shape({
        intent$: prop_types_1.PropTypes.object,
        operators: prop_types_1.PropTypes.object
    }),
    _a);
function isSFC(Component) {
    return (typeof Component == 'function');
}
function extendXComponentClass(WrappedComponent, main) {
    return _a = /** @class */ (function (_super) {
            __extends(XNode, _super);
            function XNode(props, context) {
                var _this = _super.call(this, props, context) || this;
                var engine = context[interfaces_1.XREACT_ENGINE];
                var _a = main(engine.intent$, props), actions = _a.actions, update$ = _a.update$;
                _this.machine = {
                    update$: xs_1.streamOps.merge(_this.machine.update$, update$),
                    actions: Object.assign({}, bindActions(actions, context[interfaces_1.XREACT_ENGINE].intent$, _this), _this.machine.actions)
                };
                return _this;
            }
            return XNode;
        }(WrappedComponent)),
        _a.contextTypes = exports.CONTEXT_TYPE,
        _a.displayName = "X(" + getDisplayName(WrappedComponent) + ")",
        _a;
    var _a;
}
exports.extendXComponentClass = extendXComponentClass;
function genXComponentClass(WrappedComponent, main, opts) {
    return _a = /** @class */ (function (_super) {
            __extends(XLeaf, _super);
            function XLeaf(props, context) {
                var _this = _super.call(this, props, context) || this;
                var engine = context[interfaces_1.XREACT_ENGINE];
                var _a = main(engine.intent$, props), actions = _a.actions, update$ = _a.update$;
                _this.machine = {
                    actions: bindActions(actions, engine.intent$, _this),
                    update$: update$
                };
                _this.defaultKeys = WrappedComponent.defaultProps ? Object.keys(WrappedComponent.defaultProps) : [];
                _this.state = Object.assign({}, WrappedComponent.defaultProps, pick(_this.defaultKeys, props));
                return _this;
            }
            XLeaf.prototype.componentWillReceiveProps = function (nextProps) {
                var _this = this;
                this.setState(function (state) { return Object.assign({}, nextProps, pick(_this.defaultKeys, state)); });
            };
            XLeaf.prototype.componentDidMount = function () {
                var _this = this;
                this.subscription = xs_1.streamOps.subscribe(this.machine.update$, function (action) {
                    if (action instanceof Function) {
                        if (process.env.NODE_ENV == 'debug')
                            console.log('UPDATE:', action);
                        _this.setState(function (prevState, props) {
                            var newState = action.call(_this, prevState, props);
                            var newStateWithoutPromise = {};
                            for (var i in newState) {
                                if (isPromise(newState[i])) {
                                    newState[i].then(function (v) { return _this.setState(v); });
                                }
                                else {
                                    newStateWithoutPromise[i] = newState[i];
                                }
                            }
                            _this.context[interfaces_1.XREACT_ENGINE].history$.next(newStateWithoutPromise);
                            if (process.env.NODE_ENV == 'debug')
                                console.log('STATE:', newStateWithoutPromise);
                            return newStateWithoutPromise;
                        });
                    }
                    else {
                        /* istanbul ignore next */
                        console.warn('action', action, 'need to be a Function which map from current state to new state');
                    }
                }, function () {
                    _this.context[interfaces_1.XREACT_ENGINE].history$.complete(_this.state);
                    if (process.env.NODE_ENV == 'production') {
                        console.error('YOU HAVE TERMINATED THE INTENT STREAM...');
                    }
                    if (process.env.NODE_ENV == 'debug') {
                        console.log("LAST STATE is", _this.state);
                    }
                });
            };
            XLeaf.prototype.componentWillUnmount = function () {
                this.subscription.unsubscribe();
            };
            XLeaf.prototype.render = function () {
                if (isSFC(WrappedComponent)) {
                    return react_1.createElement(WrappedComponent, Object.assign({}, opts, this.props, this.state, {
                        actions: this.machine.actions,
                    }));
                }
                else {
                    return react_1.createElement(WrappedComponent, Object.assign({}, opts, this.props, this.state, {
                        actions: this.machine.actions,
                    }));
                }
            };
            return XLeaf;
        }(interfaces_1.Xcomponent)),
        _a.contextTypes = exports.CONTEXT_TYPE,
        _a.displayName = "X(" + getDisplayName(WrappedComponent) + ")",
        _a;
    var _a;
}
exports.genXComponentClass = genXComponentClass;
function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'X';
}
function bindActions(actions, intent$, self) {
    var _actions = {
        fromEvent: function (e, f) {
            if (f === void 0) { f = function (x) { return x; }; }
            return intent$.next(f(e));
        },
        fromPromise: function (p) {
            return p.then(function (x) { return intent$.next(x); });
        },
        terminate: function (a) {
            if (process.env.NODE_ENV == 'debug')
                console.error('INTENT TERMINATED');
            return intent$.complete(a);
        }
    };
    var _loop_1 = function (a) {
        _actions[a] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return intent$.next(actions[a].apply(self, args));
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
function isPromise(p) {
    return p !== null && typeof p === 'object' && typeof p.then === 'function';
}
var _a;

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./interfaces":6,"./xs":"/lib/xs","_process":12,"prop-types":16}],9:[function(require,module,exports){
"use strict";

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;
},{}],10:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if (process.env.NODE_ENV !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
}).call(this,require('_process'))
},{"_process":12}],11:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

var emptyFunction = require('./emptyFunction');

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if (process.env.NODE_ENV !== 'production') {
  (function () {
    var printWarning = function printWarning(format) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var argIndex = 0;
      var message = 'Warning: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    };

    warning = function warning(condition, format) {
      if (format === undefined) {
        throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
      }

      if (format.indexOf('Failed Composite propType: ') === 0) {
        return; // Ignore CompositeComponent proptype check.
      }

      if (!condition) {
        for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          args[_key2 - 2] = arguments[_key2];
        }

        printWarning.apply(undefined, [format].concat(args));
      }
    };
  })();
}

module.exports = warning;
}).call(this,require('_process'))
},{"./emptyFunction":9,"_process":12}],12:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
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
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
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
        runTimeout(drainQueue);
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
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],13:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

if (process.env.NODE_ENV !== 'production') {
  var invariant = require('fbjs/lib/invariant');
  var warning = require('fbjs/lib/warning');
  var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
  var loggedTypeFailures = {};
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (process.env.NODE_ENV !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (typeSpecs.hasOwnProperty(typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          invariant(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', componentName || 'React class', location, typeSpecName);
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          warning(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
        }
      }
    }
  }
}

module.exports = checkPropTypes;

}).call(this,require('_process'))
},{"./lib/ReactPropTypesSecret":17,"_process":12,"fbjs/lib/invariant":10,"fbjs/lib/warning":11}],14:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var emptyFunction = require('fbjs/lib/emptyFunction');
var invariant = require('fbjs/lib/invariant');

module.exports = function() {
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  function shim() {
    invariant(
      false,
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    );
  };
  shim.isRequired = shim;
  function getShim() {
    return shim;
  };
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim
  };

  ReactPropTypes.checkPropTypes = emptyFunction;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

},{"fbjs/lib/emptyFunction":9,"fbjs/lib/invariant":10}],15:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var emptyFunction = require('fbjs/lib/emptyFunction');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
var checkPropTypes = require('./checkPropTypes');

module.exports = function(isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (process.env.NODE_ENV !== 'production') {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          invariant(
            false,
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
            'Use `PropTypes.checkPropTypes()` to call them. ' +
            'Read more at http://fb.me/use-check-prop-types'
          );
        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            warning(
              false,
              'You are manually calling a React.PropTypes validation ' +
              'function for the `%s` prop on `%s`. This is deprecated ' +
              'and will throw in the standalone `prop-types` package. ' +
              'You may be seeing this warning due to a third-party PropTypes ' +
              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.',
              propFullName,
              componentName
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }
          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction.thatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues);
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== 'function') {
        warning(
          false,
          'Invalid argument supplid to oneOfType. Expected an array of check functions, but ' +
          'received %s at index %s.',
          getPostfixForTypeWarning(checker),
          i
        );
        return emptyFunction.thatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;
      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;
      default:
        return type;
    }
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

}).call(this,require('_process'))
},{"./checkPropTypes":13,"./lib/ReactPropTypesSecret":17,"_process":12,"fbjs/lib/emptyFunction":9,"fbjs/lib/invariant":10,"fbjs/lib/warning":11}],16:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

if (process.env.NODE_ENV !== 'production') {
  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
    Symbol.for &&
    Symbol.for('react.element')) ||
    0xeac7;

  var isValidElement = function(object) {
    return typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE;
  };

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = require('./factoryWithTypeCheckers')(isValidElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = require('./factoryWithThrowingShims')();
}

}).call(this,require('_process'))
},{"./factoryWithThrowingShims":14,"./factoryWithTypeCheckers":15,"_process":12}],17:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;

},{}]},{},[5])(5)
});