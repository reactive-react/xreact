"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var most_1 = require("most");
var Traveler = (function () {
    function Traveler(history, path) {
        var _this = this;
        this.history = history;
        this.path = path;
        this.travel = most_1.from(this.path)
            .sample(function (offset, states) {
            var cursor = offset(states.length + _this.cursor);
            if (cursor < states.length && cursor >= 0) {
                _this.cursor = offset(_this.cursor);
                return states[cursor].value;
            }
        }, this.path, this.history)
            .filter(function (x) { return !!x; });
    }
    Traveler.prototype.forward = function () {
        this.path.send(function (x) { return x + 1; });
    };
    Traveler.prototype.backward = function () {
        this.path.send(function (x) { return x - 1; });
    };
    return Traveler;
}());
exports.Traveler = Traveler;
function initHistory(engineHistory, engineTravel) {
    var history = most_1.from(engineHistory)
        .timestamp()
        .scan(function (acc, state) {
        acc.push(state);
        return acc;
    }, [])
        .multicast();
    return new Traveler(history, engineTravel);
}
exports.default = initHistory;
