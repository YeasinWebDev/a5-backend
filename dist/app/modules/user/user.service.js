"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
// error 
const commonError_1 = require("../../errorHelpers/commonError");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
// interfaces
const transaction_interface_1 = require("../transaction/transaction.interface");
const user_interface_1 = require("./user.interface");
// models
const user_model_1 = require("./user.model");
const transaction_model_1 = require("../transaction/transaction.model");
const wallet_model_1 = require("../wallet/wallet.model");
// for admin
const getAllData = () => __awaiter(void 0, void 0, void 0, function* () {
    const allUsers = yield user_model_1.User.find({ role: "user" });
    const allAgents = yield user_model_1.User.find({ role: "agent" });
    const allWallets = yield wallet_model_1.Wallet.find({});
    const allTransactions = yield transaction_model_1.Transaction.find({});
    return { allUsers, allAgents, allWallets, allTransactions };
});
const updateWalletStatus = (walletId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findOne({ user: walletId }).populate("user", "name");
    if (!wallet) {
        throw new AppError_1.default("Wallet not found", 400);
    }
    if (status === null || status === undefined) {
        throw new AppError_1.default("please provide status", 400);
    }
    wallet.isBlocked = status;
    yield wallet.save();
    const walletData = {
        _id: wallet._id,
        userId: wallet.user._id,
        userName: wallet.user.name,
        balance: wallet.balance,
        isBlocked: wallet.isBlocked,
    };
    return { wallet: walletData };
});
const updateAgentStatus = (agentId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield user_model_1.User.findOne({ _id: agentId });
    let updateStatus;
    if (!agent) {
        throw new AppError_1.default("Agent not found", 400);
    }
    if (agent.role !== "agent") {
        throw new AppError_1.default("User is not an agent", 400);
    }
    if (status === "approved") {
        updateStatus = user_interface_1.IAgentStatus.approved;
    }
    else if (status === "suspend") {
        updateStatus = user_interface_1.IAgentStatus.suspended;
    }
    else {
        throw new AppError_1.default("Invalid status. status only can be approved or suspend or pending", 400);
    }
    agent.agentStatus = updateStatus;
    yield agent.save();
    return { agent };
});
// for agent
const cashInMoney = (data, agent) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, amount } = data;
    const wallet = yield wallet_model_1.Wallet.findOne({ user: userId });
    const agentWallet = yield wallet_model_1.Wallet.findOne({ user: agent.userId }).populate("user", "name");
    (0, commonError_1.commonError)(wallet, "User");
    (0, commonError_1.commonError)(agentWallet, "Agent");
    if (agentWallet.balance < amount) {
        throw new Error("Agent does not have enough balance");
    }
    wallet.balance += amount;
    agentWallet.balance -= amount;
    yield wallet.save();
    yield agentWallet.save();
    const transaction = yield transaction_model_1.Transaction.create({
        type: transaction_interface_1.ITransactionType.cashIn,
        sender: agent.userId,
        senderName: agentWallet.user.name,
        receiver: userId,
        receiverName: wallet.user.name,
        amount: amount,
        status: transaction_interface_1.ITransactionStatus.completed,
        commission: 0,
    });
    console.log(transaction);
    return { wallet, transaction };
});
const cashOutMoney = (data, agent) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, amount } = data;
    const wallet = yield wallet_model_1.Wallet.findOne({ user: userId }).populate("user", "name");
    const agentWallet = yield wallet_model_1.Wallet.findOne({ user: agent.userId }).populate("user", "name");
    (0, commonError_1.commonError)(wallet, "User");
    (0, commonError_1.commonError)(agentWallet, "Agent");
    const commission = Number(amount * 0.02);
    if (wallet.balance < commission + amount) {
        throw new Error(`User does not have enough balance . Commission is ${commission}. user balance is ${wallet.balance}`);
    }
    wallet.balance -= commission;
    wallet.balance -= amount;
    agentWallet.balance += amount;
    yield wallet.save();
    yield agentWallet.save();
    const transaction = yield transaction_model_1.Transaction.create({
        type: transaction_interface_1.ITransactionType.cashOut,
        sender: userId,
        senderName: wallet.user.name,
        receiver: agent.userId,
        receiverName: agentWallet.user.name,
        amount: amount,
        status: transaction_interface_1.ITransactionStatus.completed,
        commission: commission,
    });
    return { wallet, transaction };
});
const getCommissions = (agent) => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield transaction_model_1.Transaction.find({ receiver: agent.userId }).sort({ createdAt: -1 }).populate("sender", "name").populate("receiver", "name");
    const transactionData = transactions.map((transaction) => {
        var _a, _b;
        return {
            _id: transaction._id,
            type: transaction.type,
            sender: (_a = transaction.sender) === null || _a === void 0 ? void 0 : _a._id,
            senderName: transaction.sender.name,
            receiver: (_b = transaction.receiver) === null || _b === void 0 ? void 0 : _b._id,
            receiverName: transaction.receiver.name,
            amount: transaction.amount,
            commission: transaction.commission,
            status: transaction.status,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
        };
    });
    return { transactions: transactionData };
});
// for user
const addMoney = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, amount } = data;
    const wallet = yield wallet_model_1.Wallet.findOne({ user: userId }).populate("user", "name");
    (0, commonError_1.commonError)(wallet, "User");
    wallet.balance += amount;
    yield wallet.save();
    const transaction = yield transaction_model_1.Transaction.create({
        type: transaction_interface_1.ITransactionType.topUp,
        sender: userId,
        senderName: wallet.user.name,
        receiver: userId,
        receiverName: wallet.user.name,
        amount: amount,
        status: transaction_interface_1.ITransactionStatus.completed,
        commission: 0,
    });
    const walletData = {
        _id: wallet._id,
        user: wallet.user.name,
        balance: wallet.balance,
        isBlocked: wallet.isBlocked,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
    };
    return { wallet: walletData, transaction };
});
const withdrawMoney = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, amount } = data;
    const wallet = yield wallet_model_1.Wallet.findOne({ user: userId });
    (0, commonError_1.commonError)(wallet, "User");
    if (wallet.balance < amount) {
        throw new Error("User does not have enough balance");
    }
    wallet.balance -= amount;
    yield wallet.save();
    const transaction = yield transaction_model_1.Transaction.create({
        type: transaction_interface_1.ITransactionType.withdraw,
        sender: userId,
        senderName: wallet.user.name,
        receiver: userId,
        receiverName: wallet.user.name,
        amount: amount,
        status: transaction_interface_1.ITransactionStatus.completed,
        commission: 0,
    });
    const walletData = {
        _id: wallet._id,
        user: wallet.user.name,
        balance: wallet.balance,
        isBlocked: wallet.isBlocked,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
    };
    return { wallet: walletData, transaction };
});
const sendMoney = (data, sender) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, amount } = data;
    const wallet = yield wallet_model_1.Wallet.findOne({ user: userId }).populate("user", "name");
    const senderWallet = yield wallet_model_1.Wallet.findOne({ user: sender.userId }).populate("user", "name");
    (0, commonError_1.commonError)(wallet, "User");
    (0, commonError_1.commonError)(senderWallet, "Sender");
    if (wallet.balance < amount) {
        throw new Error("User does not have enough balance");
    }
    senderWallet.balance -= amount;
    wallet.balance += amount;
    yield wallet.save();
    yield senderWallet.save();
    const transaction = yield transaction_model_1.Transaction.create({
        type: transaction_interface_1.ITransactionType.send,
        sender: sender.userId,
        senderName: senderWallet.user.name,
        receiver: userId,
        receiverName: wallet.user.name,
        amount: amount,
        status: transaction_interface_1.ITransactionStatus.completed,
        commission: 0,
    });
    const walletData = {
        _id: wallet._id,
        user: wallet.user.name,
        balance: wallet.balance,
        isBlocked: wallet.isBlocked,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
    };
    return { wallet: walletData, transaction };
});
const getTransactions = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield transaction_model_1.Transaction.find({
        $or: [{ sender: userId }, { receiver: userId }],
    })
        .populate("sender", "name")
        .populate("receiver", "name")
        .sort({ createdAt: -1 });
    const transactionData = transactions.map((transaction) => {
        var _a, _b, _c, _d;
        return {
            _id: transaction._id,
            type: transaction.type,
            sender: (_a = transaction.sender) === null || _a === void 0 ? void 0 : _a._id,
            senderName: (_b = transaction.sender) === null || _b === void 0 ? void 0 : _b.name,
            receiver: (_c = transaction.receiver) === null || _c === void 0 ? void 0 : _c._id,
            receiverName: (_d = transaction.receiver) === null || _d === void 0 ? void 0 : _d.name,
            amount: transaction.amount,
            status: transaction.status,
            commission: transaction.commission,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
        };
    });
    return { transactions: transactionData };
});
exports.userService = {
    // admin
    getAllData,
    updateWalletStatus,
    updateAgentStatus,
    // agent
    cashInMoney,
    cashOutMoney,
    getCommissions,
    // user
    addMoney,
    withdrawMoney,
    sendMoney,
    getTransactions,
};
