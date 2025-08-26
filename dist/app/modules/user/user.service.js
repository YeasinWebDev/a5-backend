"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.userService = exports.getTransactions = exports.getAgentTransactions = void 0;
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
const mongoose_1 = __importStar(require("mongoose"));
// for admin
const getStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const totalUsers = yield user_model_1.User.countDocuments({ role: "user" });
    const totalAgents = yield user_model_1.User.countDocuments({ role: "agent" });
    const totalTransactions = yield transaction_model_1.Transaction.countDocuments({});
    const totalTransactionsMoney = yield transaction_model_1.Transaction.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
    const userPieChartData = yield user_model_1.User.aggregate([
        { $match: { role: { $ne: "admin" } } },
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                role: "$_id",
                count: 1,
            },
        },
    ]);
    const typeBarChartData = yield transaction_model_1.Transaction.aggregate([
        {
            $group: {
                _id: "$type",
                count: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                type: "$_id",
                count: 1,
            },
        },
    ]);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const transactionVolume7Days = yield transaction_model_1.Transaction.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                volume: { $sum: "$amount" },
                firstCreatedAt: { $first: "$createdAt" },
            },
        },
        { $sort: { _id: 1 } },
    ]);
    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const resultWithDayName = transactionVolume7Days.map((item) => (Object.assign(Object.assign({}, item), { dayName: weekDays[item.firstCreatedAt.getDay()].slice(0, 3) })));
    return {
        totalUsers,
        totalAgents,
        totalTransactions,
        totalVolume: (_a = totalTransactionsMoney[0]) === null || _a === void 0 ? void 0 : _a.total,
        userPieChartData,
        typeBarChartData,
        transactionVolume7Days: resultWithDayName,
    };
});
const getAllUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const role = query.role;
    const result = yield user_model_1.User.find({ role: role }).select("-password").skip(skip).limit(limit);
    const total = yield user_model_1.User.countDocuments({ role: role });
    return {
        data: result,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
});
const getAllData = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { page = 1, limit = 10, type, status, minAmount, maxAmount, search } = query;
    const filter = {};
    if (type)
        filter.type = type;
    if (status)
        filter.status = status;
    if (minAmount || maxAmount) {
        filter.amount = {};
        if (minAmount)
            filter.amount.$gte = Number(minAmount);
        if (maxAmount)
            filter.amount.$lte = Number(maxAmount);
    }
    const pipeLine = [
        { $match: filter },
        { $lookup: { from: "users", localField: "sender", foreignField: "_id", as: "sender" } },
        { $unwind: "$sender" },
        { $lookup: { from: "users", localField: "receiver", foreignField: "_id", as: "receiver" } },
        { $unwind: "$receiver" },
    ];
    if (search) {
        pipeLine.push({
            $match: {
                $or: [{ senderName: { $regex: search, $options: "i" } }, { receiverName: { $regex: search, $options: "i" } }],
            },
        });
    }
    const transactions = yield transaction_model_1.Transaction.aggregate([...pipeLine, { $sort: { createdAt: -1 } }, { $skip: (page - 1) * limit }, { $limit: Number(limit) }]);
    const countResult = yield transaction_model_1.Transaction.aggregate([...pipeLine, { $count: "count" }]);
    const total = ((_b = countResult[0]) === null || _b === void 0 ? void 0 : _b.count) || 0;
    const transactionData = transactions.map((transaction) => {
        var _a, _b, _c, _d;
        return ({
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
        });
    });
    return { transactionData, total, page, limit, totalPages: Math.ceil(total / limit) };
});
const updateUserStatus = (userId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ _id: userId });
    if (!user) {
        throw new AppError_1.default("User not found", 400);
    }
    console.log(userId, status);
    user.isBlocked = status;
    yield user.save();
    return { user };
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
const getAgentStats = (agent) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e;
    const receiverId = new mongoose_1.default.Types.ObjectId(String(agent.userId));
    const senderId = new mongoose_1.default.Types.ObjectId(String(agent.userId));
    const userBalance = yield wallet_model_1.Wallet.findOne({ user: agent.userId });
    const totalCashIn = yield transaction_model_1.Transaction.aggregate([
        {
            $match: {
                $or: [{ receiver: receiverId }, { sender: senderId }],
                type: "cash-in",
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amount" },
            },
        },
    ]);
    const totalCashOut = yield transaction_model_1.Transaction.aggregate([
        {
            $match: {
                $or: [{ receiver: receiverId }, { sender: senderId }],
                type: "cash-out",
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amount" },
            },
        },
    ]);
    const totalCommission = yield transaction_model_1.Transaction.aggregate([
        {
            $match: {
                $or: [{ receiver: receiverId }, { sender: senderId }],
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$commission" },
            },
        },
    ]);
    const recentTransactions = yield transaction_model_1.Transaction.find({ $or: [{ receiver: receiverId }, { sender: senderId }] })
        .sort({ createdAt: -1 })
        .limit(5);
    return {
        balance: userBalance.balance,
        totalCashIn: ((_c = totalCashIn[0]) === null || _c === void 0 ? void 0 : _c.total) || 0,
        totalCashOut: ((_d = totalCashOut[0]) === null || _d === void 0 ? void 0 : _d.total) || 0,
        totalCommission: ((_e = totalCommission[0]) === null || _e === void 0 ? void 0 : _e.total) || 0,
        recentTransactions,
    };
});
const cashInMoney = (data, agent) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, amount } = data;
    const user = yield user_model_1.User.findOne({ email });
    const wallet = yield wallet_model_1.Wallet.findOne({ user: user === null || user === void 0 ? void 0 : user._id }).populate("user", "name");
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
        receiver: user === null || user === void 0 ? void 0 : user._id,
        receiverName: wallet.user.name,
        amount: amount,
        status: transaction_interface_1.ITransactionStatus.completed,
        commission: 0,
    });
    return { wallet, transaction };
});
const cashOutMoney = (data, agent) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, amount } = data;
    const user = yield user_model_1.User.findOne({ email });
    const wallet = yield wallet_model_1.Wallet.findOne({ user: user === null || user === void 0 ? void 0 : user._id }).populate("user", "name");
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
        sender: user === null || user === void 0 ? void 0 : user._id,
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
const getAgentTransactions = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10 } = query;
    const filter = {
        $or: [{ sender: new mongoose_1.Types.ObjectId(userId) }, { receiver: new mongoose_1.Types.ObjectId(userId) }],
    };
    const total = yield transaction_model_1.Transaction.countDocuments(filter);
    const transactions = yield transaction_model_1.Transaction.find(filter || {})
        .populate("sender", "name")
        .populate("receiver", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const transactionData = transactions.map((transaction) => {
        var _a, _b, _c, _d;
        return ({
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
        });
    });
    return {
        transactions: transactionData,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
});
exports.getAgentTransactions = getAgentTransactions;
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
    const wallet = yield wallet_model_1.Wallet.findOne({ user: userId }).populate("user", "name");
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
    const { email, amount } = data;
    const user = yield user_model_1.User.findOne({ email });
    const wallet = yield wallet_model_1.Wallet.findOne({ user: user === null || user === void 0 ? void 0 : user._id }).populate("user", "name");
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
        receiver: user === null || user === void 0 ? void 0 : user._id,
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
const getTransactions = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, type, startDate, endDate } = query;
    const filter = {
        $or: [{ sender: new mongoose_1.Types.ObjectId(userId) }, { receiver: new mongoose_1.Types.ObjectId(userId) }],
    };
    if (type && (type === "send" || type === "withdraw" || type === "topUp" || type === "cash-in" || type === "cash-out" || type === "topUp")) {
        filter.type = type;
    }
    if (startDate && endDate && startDate !== "undefined" && endDate !== "undefined") {
        console.log("inside");
        filter.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
    }
    const total = yield transaction_model_1.Transaction.countDocuments(filter);
    const transactions = yield transaction_model_1.Transaction.find(filter || {})
        .populate("sender", "name")
        .populate("receiver", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const transactionData = transactions.map((transaction) => {
        var _a, _b, _c, _d;
        return ({
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
        });
    });
    return {
        transactions: transactionData,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
});
exports.getTransactions = getTransactions;
const searchUser = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.User.find({ email: { $regex: query, $options: "i" }, role: user_interface_1.IUserRole.user });
    return { users };
});
exports.userService = {
    // admin
    getStats,
    getAllUsers,
    getAllData,
    updateUserStatus,
    updateAgentStatus,
    // agent
    getAgentStats,
    cashInMoney,
    cashOutMoney,
    getCommissions,
    getAgentTransactions: exports.getAgentTransactions,
    // user
    addMoney,
    withdrawMoney,
    sendMoney,
    getTransactions: exports.getTransactions,
    searchUser,
};
