"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xreact_1 = require("xreact");
var react_dom_1 = require("react-dom");
var React = require("react");
var most = require("most");
var rest = require("rest");
var MOST = require("xreact/lib/xs/most");
var GITHUB_SEARCH_API = 'https://api.github.com/search/repositories?q=';
var TypeNsearch = function (props) {
    var search = props.actions.search;
    var error = props.error || {};
    return React.createElement("div", null,
        React.createElement("input", { onChange: function (e) { return search(e.target.value); } }),
        React.createElement("span", { className: "red " + error.className }, error.message),
        React.createElement("ul", null, props.results.map(function (item) {
            return React.createElement("li", { key: item.id },
                React.createElement("a", { href: item.html_url },
                    item.full_name,
                    " (",
                    item.stargazers_count,
                    ")"));
        })));
};
TypeNsearch.defaultProps = {
    results: []
};
var log = function (x) { return console.log(x); };
var MostTypeNSearch = xreact_1.x(function (intent$) {
    var updateSink$ = intent$.filter(function (i) { return i.type == 'search'; })
        .debounce(500)
        .map(function (intent) { return intent.value; })
        .filter(function (query) { return query.length > 0; })
        .map(function (query) { return GITHUB_SEARCH_API + query; })
        .map(function (url) { return rest(url).then(function (resp) { return ({
        type: 'dataUpdate',
        value: resp.entity
    }); }).catch(function (error) {
        console.error('API REQUEST ERROR:', error);
        return {
            type: 'dataError',
            value: error.message
        };
    }); })
        .flatMap(most.fromPromise)
        .filter(function (i) { return i.type == 'dataUpdate'; })
        .map(function (data) { return JSON.parse(data.value).items; })
        .map(function (items) { return items.slice(0, 10); })
        .map(function (items) { return function (state) { return ({ results: items }); }; })
        .flatMapError(function (error) {
        console.log('[CRITICAL ERROR]:', error);
        return most.of({ message: error.error, className: 'display' })
            .merge(most.of({ className: 'hidden' }).delay(3000))
            .map(function (error) { return function (state) { return ({ error: error }); }; });
    });
    return {
        actions: {
            search: function (value) { return ({ type: 'search', value: value }); },
        },
        update$: updateSink$
    };
})(TypeNsearch);
react_dom_1.render(React.createElement(xreact_1.default, { x: MOST },
    React.createElement(MostTypeNSearch, null)), document.getElementById('app'));
