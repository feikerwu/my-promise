"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var STATE;
(function (STATE) {
    STATE["PENDING"] = "PENDING";
    STATE["FULLFILLED"] = "FULLFILLED";
    STATE["REJECTED"] = "REJECTED";
})(STATE || (STATE = {}));
class MyPromise {
    constructor(executor) {
        this._state = STATE.PENDING;
        this.chain = [];
        try {
            executor(value => this.resolve(value), err => this.reject(err));
        }
        catch (err) {
            this.reject(err);
        }
    }
    resolve(value) {
        if (this._state !== STATE.PENDING) {
            return;
        }
        this._state = STATE.FULLFILLED;
        this.chain.forEach(({ onfullfilled }) => {
            setImmediate(onfullfilled(value));
        });
    }
    reject(reason) {
        if (this._state !== STATE.PENDING) {
            return;
        }
        this._state = STATE.REJECTED;
        this.chain.forEach(({ onrejected }) => {
            setImmediate(onrejected);
        });
    }
    then(onfullfilled, onrejected) {
        this.chain.push({ onfullfilled, onrejected });
    }
    get state() {
        return this._state;
    }
}
exports.MyPromise = MyPromise;
const p = new MyPromise((resolve, reject) => {
    setTimeout(() => resolve(), 3000);
}).then(value => console.log(value), err => console.error(err));
console.log(p);
