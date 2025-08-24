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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
// internal imports
const auth_service_1 = require("./auth.service");
const sendResponse_1 = require("../../../utils/sendResponse");
/**
 * authController
 * @description This controller is used to create user, login user, create agent
 */
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield auth_service_1.authService.createUser(req.body, res, next);
        (0, sendResponse_1.sendResponse)(res, 200, "User created successfully", result);
    }
    catch (error) {
        next(error);
    }
});
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield auth_service_1.authService.login(req.body, res, next);
        (0, sendResponse_1.sendResponse)(res, 200, "User logged in successfully", result);
    }
    catch (error) {
        next(error);
    }
});
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new Error("Refresh Token Not Found");
        }
        const result = yield auth_service_1.authService.refreshToken(refreshToken);
        (0, sendResponse_1.sendResponse)(res, 200, "User logged in successfully", result);
    }
    catch (error) {
        next(error);
    }
});
const me = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield auth_service_1.authService.me(req.user);
        (0, sendResponse_1.sendResponse)(res, 200, "User logged in successfully", result);
    }
    catch (error) {
        next(error);
    }
});
const profileUpdate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield auth_service_1.authService.profileUpdate(req.user, req.body);
        (0, sendResponse_1.sendResponse)(res, 200, "Profile update  successfully", result);
    }
    catch (error) {
        next(error);
    }
});
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
        });
        (0, sendResponse_1.sendResponse)(res, 200, "Logout Successfully", {});
    }
    catch (error) {
        next(error);
    }
});
exports.authController = {
    createUser,
    login,
    refreshToken,
    me,
    logout,
    profileUpdate,
};
