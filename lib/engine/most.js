"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var most_1 = require("most");
var most_subject_1 = require("most-subject");
var Engine = (function () {
    function Engine() {
        this.intentStream = most_subject_1.async();
        this.intentStream.send = this.intentStream.next.bind(this.intentStream);
        this.historyStream = most_subject_1.async();
        this.historyStream.send = this.historyStream.next.bind(this.historyStream);
        this.travelStream = most_subject_1.async();
        this.travelStream.send = this.travelStream.next.bind(this.historyStream);
    }
    Engine.prototype.observe = function (actionsSinks, f) {
        var subscriptions = actionsSinks
            .recoverWith(function (e) {
            console.error('There is Error in your reducer:', e, e.stack);
            return most_1.of(function (x) { return x; });
        })
            .subscribe({
            next: f,
            error: function (e) { return console.error('Something is Wrong:', e, e.stack); },
            complete: f
        });
        return subscriptions;
    };
    return Engine;
}());
exports.Engine = Engine;
