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
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// internal imports
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_interface_1 = require("../user/user.interface");
const userToken_1 = require("../../../utils/userToken");
const user_model_1 = require("../user/user.model");
const wallet_model_1 = require("../wallet/wallet.model");
/**
 * auth services
 *
 * @description This service is used to create user, login user
 */
const createUser = (body, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const existingEmailUser = yield user_model_1.User.findOne({ email: body.email });
    if (existingEmailUser) {
        throw new AppError_1.default("Email already exists", 400);
    }
    const existingPhoneUser = yield user_model_1.User.findOne({ phone: body.phone });
    if (existingPhoneUser) {
        throw new AppError_1.default("Phone number already exists", 400);
    }
    const hashPassword = yield bcryptjs_1.default.hash(body.password, 10);
    body.password = hashPassword;
    const user = yield user_model_1.User.create(body);
    yield wallet_model_1.Wallet.create({ user: user._id });
    const token = (0, userToken_1.createToken)(user);
    res.cookie("accessToken", token.accessToken, {
        httpOnly: true,
        secure: true,
    });
    return user;
});
const login = (body, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ email: body.email });
    if (!user) {
        throw new AppError_1.default("Invalid email or password", 400);
    }
    const isPasswordMatch = yield bcryptjs_1.default.compare(body.password, user.password);
    if (!isPasswordMatch) {
        throw new AppError_1.default("Invalid email or password", 400);
    }
    const token = (0, userToken_1.createToken)(user);
    res.cookie("accessToken", token.accessToken, {
        httpOnly: true,
        secure: true,
    });
    return { user, token: token.accessToken };
});
const createAgent = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default("User does not exist", 400);
    }
    if (user.role === user_interface_1.IUserRole.agent) {
        throw new AppError_1.default("User is already an agent", 400);
    }
    user.role = user_interface_1.IUserRole.agent;
    user.agentStatus = user_interface_1.IAgentStatus.approved;
    yield user.save();
    return user;
});
exports.authService = {
    createUser,
    createAgent,
    login,
};
