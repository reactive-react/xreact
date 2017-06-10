"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_dom_1 = require("react-dom");
var xreact_1 = require("xreact");
var rx = require("xreact/lib/xs/rx");
var when = require("when");
var most_1 = require("most");
var ramda_1 = require("ramda");
var Type = require("union-type");
var Intent = Type({
    Inc: [Number],
    Dec: [Number],
    Double: [],
    Half: []
});
var CounterView = function (props) { return (React.createElement("div", null,
    React.createElement("button", { onClick: function () { return props.actions.half(); } }, "/2"),
    React.createElement("button", { onClick: function () { return props.actions.dec(1); } }, "-1"),
    React.createElement("span", null, props.count),
    React.createElement("button", { onClick: function () { return props.actions.inc(1); } }, "+1"),
    React.createElement("button", { onClick: function () { return props.actions.double(); } }, "*2"))); };
CounterView.defaultProps = { count: 0 };
var lensCount = ramda_1.lensProp('count');
var asyncInitCount11 = xreact_1.x(function (intent$) {
    return {
        update$: most_1.just(11)
            .flatMap(ramda_1.compose(most_1.fromPromise, when))
            .map(ramda_1.set(lensCount))
    };
});
var doublable = xreact_1.x(function (intent$) {
    return {
        update$: intent$.map(Intent.case({
            Double: function () { return ramda_1.over(lensCount, function (x) { return x * 2; }); },
            Half: function () { return ramda_1.over(lensCount, function (x) { return x / 2; }); },
            _: function () { return ramda_1.identity; }
        })),
        actions: {
            double: function () { return Intent.Double; },
            half: function () { return Intent.Half; },
        }
    };
});
var increasable = xreact_1.x(function (intent$) {
    return {
        update$: intent$.map(Intent.case({
            Inc: function (v) { return ramda_1.over(lensCount, function (x) { return x + v; }); },
            Dec: function (v) { return ramda_1.over(lensCount, function (x) { return x - v; }); },
            _: function () { return ramda_1.identity; }
        })),
        actions: {
            inc: Intent.Inc,
            dec: Intent.Dec,
        }
    };
});
var wrapper = ramda_1.compose(asyncInitCount11, doublable, increasable);
var Counter = wrapper(CounterView);
react_dom_1.render(React.createElement(xreact_1.default, { x: rx },
    React.createElement(Counter, null)), document.getElementById('app'));
