"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITransactionStatus = exports.ITransactionType = void 0;
var ITransactionType;
(function (ITransactionType) {
    ITransactionType["topUp"] = "topUp";
    ITransactionType["withdraw"] = "withdraw";
    ITransactionType["send"] = "send";
    ITransactionType["cashIn"] = "cash-in";
    ITransactionType["cashOut"] = "cash-out";
})(ITransactionType || (exports.ITransactionType = ITransactionType = {}));
var ITransactionStatus;
(function (ITransactionStatus) {
    ITransactionStatus["pending"] = "pending";
    ITransactionStatus["completed"] = "completed";
    ITransactionStatus["failed"] = "failed";
})(ITransactionStatus || (exports.ITransactionStatus = ITransactionStatus = {}));
