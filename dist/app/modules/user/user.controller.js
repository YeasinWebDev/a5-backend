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
exports.userController = void 0;
const user_service_1 = require("./user.service");
const sendResponse_1 = require("../../../utils/sendResponse");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
// for admin 
const getAllData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield user_service_1.userService.getAllData();
        (0, sendResponse_1.sendResponse)(res, 200, "Data fetched successfully", result);
    }
    catch (error) {
        next(error);
    }
});
const updateWalletStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletId = req.params.walletId;
        const status = req.body.status;
        const result = yield user_service_1.userService.updateWalletStatus(walletId, status);
        (0, sendResponse_1.sendResponse)(res, 200, "Wallet status updated successfully", result);
    }
    catch (error) {
        next(error);
    }
});
const updateAgentStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agentId = req.params.agentId;
        const status = req.body.status;
        const result = yield user_service_1.userService.updateAgentStatus(agentId, status);
        (0, sendResponse_1.sendResponse)(res, 200, "Agent status updated successfully", result);
    }
    catch (error) {
        next(error);
    }
});
// for agent
const cashInMoney = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const agent = req.user;
        if (!(data === null || data === void 0 ? void 0 : data.userId) || !(data === null || data === void 0 ? void 0 : data.amount)) {
            throw new Error("User id and amount is required");
        }
        const result = yield user_service_1.userService.cashInMoney(data, agent);
        (0, sendResponse_1.sendResponse)(res, 200, "Cash in successfully", result);
    }
    catch (error) {
        next(error);
    }
});
const cashOutMoney = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const agent = req.user;
        if (!(data === null || data === void 0 ? void 0 : data.userId) || !(data === null || data === void 0 ? void 0 : data.amount)) {
            throw new Error("User id and amount is required");
        }
        const result = yield user_service_1.userService.cashOutMoney(data, agent);
        (0, sendResponse_1.sendResponse)(res, 200, "Cash out successfully", result);
    }
    catch (error) {
        next(error);
    }
});
const getCommissions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agent = req.user;
        const result = yield user_service_1.userService.getCommissions(agent);
        (0, sendResponse_1.sendResponse)(res, 200, "Commissions retrieved successfully", result);
    }
    catch (error) {
        next(error);
    }
});
// for user
const addMoney = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const result = yield user_service_1.userService.addMoney(data);
        (0, sendResponse_1.sendResponse)(res, 200, "Money added successfully", result);
    }
    catch (error) {
        next(error);
    }
});
const withdrawMoney = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const result = yield user_service_1.userService.withdrawMoney(data);
        (0, sendResponse_1.sendResponse)(res, 200, "withdraw Money successfully", result);
    }
    catch (error) {
        next(error);
    }
});
const sendMoney = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const sender = req.user;
        if (!(data === null || data === void 0 ? void 0 : data.userId) || !(data === null || data === void 0 ? void 0 : data.amount)) {
            throw new AppError_1.default("User id and amount is required", 500);
        }
        const result = yield user_service_1.userService.sendMoney(data, sender);
        (0, sendResponse_1.sendResponse)(res, 200, "Send Money successfully", result);
    }
    catch (error) {
        next(error);
    }
});
const getTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield user_service_1.userService.getTransactions(req.user.userId);
        (0, sendResponse_1.sendResponse)(res, 200, "Transactions retrieved successfully", result);
    }
    catch (error) {
        next(error);
    }
});
exports.userController = {
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
    sendMoney,
    withdrawMoney,
    getTransactions,
};
