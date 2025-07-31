"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const transaction_interface_1 = require("./transaction.interface");
const transactionSchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        enum: Object.values(transaction_interface_1.ITransactionType),
        required: true,
    },
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    senderName: {
        type: String
    },
    receiver: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    receiverName: {
        type: String
    },
    amount: {
        type: Number,
        required: true,
    },
    commission: {
        type: Number,
    },
    status: {
        type: String,
        enum: Object.values(transaction_interface_1.ITransactionStatus),
        default: transaction_interface_1.ITransactionStatus.pending,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true, versionKey: false });
exports.Transaction = mongoose_1.default.model("Transaction", transactionSchema);
