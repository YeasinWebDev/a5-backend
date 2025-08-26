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
const jwt_1 = require("../../../utils/jwt");
const env_1 = require("../../config/env");
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
    if (body.role === "agent") {
        body.agentStatus = user_interface_1.IAgentStatus.approved;
    }
    const user = yield user_model_1.User.create(body);
    yield wallet_model_1.Wallet.create({ user: user._id });
    const token = (0, userToken_1.createToken)(user);
    res.cookie("accessToken", token.accessToken, {
        httpOnly: true,
        secure: true,
    });
    res.cookie("refreshToken", token.refreshToken, {
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
    res.cookie("refreshToken", token.refreshToken, {
        httpOnly: true,
        secure: true,
    });
    return { user, accessToken: token.accessToken, refreshToken: token.refreshToken };
});
const refreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const verfiyRefreshToken = (0, jwt_1.verifyToken)(refreshToken, env_1.envVars.JWT_SECRET);
    if (!verfiyRefreshToken) {
        throw new Error("Invalid Refresh Token");
    }
    const isUserExist = yield user_model_1.User.findOne({
        email: verfiyRefreshToken.email,
    });
    if (!isUserExist) {
        throw new Error("User Not Found");
    }
    const userPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role,
    };
    const accessToken = (0, jwt_1.generateToken)(userPayload, env_1.envVars.JWT_SECRET, "1d");
    return { accessToken };
});
const profileUpdate = (user, body) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone, oldPassword, newPassword } = body;
    const isUserExist = yield user_model_1.User.findOne({
        email: user.email,
    });
    if (!isUserExist) {
        throw new AppError_1.default("User Not Found", 400);
    }
    if (oldPassword) {
        const passowrdMatch = yield bcryptjs_1.default.compare(oldPassword, isUserExist.password);
        if (!passowrdMatch) {
            throw new AppError_1.default("Invalid Old Password", 400);
        }
        if (!newPassword) {
            throw new AppError_1.default("New Password is required", 400);
        }
        const hashPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        isUserExist.password = hashPassword;
    }
    if (name) {
        isUserExist.name = name;
    }
    if (phone) {
        const existingPhoneUser = yield user_model_1.User.findOne({ phone });
        if (existingPhoneUser) {
            throw new AppError_1.default("Phone number already exists", 400);
        }
        isUserExist.phone = phone;
    }
    yield isUserExist.save();
    return isUserExist;
});
const me = (decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedToken.userId);
    if (!user) {
        throw new Error("User Not Found");
    }
    const wallet = yield wallet_model_1.Wallet.findOne({ user: user._id });
    return { user, balance: wallet.balance };
});
exports.authService = {
    createUser,
    login,
    refreshToken,
    me,
    profileUpdate,
};
