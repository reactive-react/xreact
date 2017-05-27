"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Header_1 = require("./components/Header");
var MainSection_1 = require("./components/MainSection");
var react_dom_1 = require("react-dom");
var react_most_1 = require("react-most");
var App = function () {
    return (React.createElement("div", null,
        React.createElement(Header_1.default, null),
        React.createElement(MainSection_1.default, null)));
};
react_dom_1.render(React.createElement(react_most_1.default, null,
    React.createElement(App, null)), document.getElementById('app'));
