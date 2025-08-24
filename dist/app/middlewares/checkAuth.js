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
exports.checkAuth = void 0;
// internal imports
const env_1 = require("../config/env");
const jwt_1 = require("../../utils/jwt");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const user_model_1 = require("../modules/user/user.model");
const wallet_model_1 = require("../modules/wallet/wallet.model");
/**
 * A middleware to check if the user is authenticated and has the required roles to access the route
 * @param  {...string[]} authRoles - The roles that are allowed to access the route
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<void>}
 */
const checkAuth = (...authRoles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = req.headers.authorization || req.cookies.accessToken;
    try {
        const decoded = (0, jwt_1.verifyToken)(accessToken, env_1.envVars.JWT_SECRET);
        const isUserExist = yield user_model_1.User.findOne({ email: decoded.email });
        if (!isUserExist) {
            throw new AppError_1.default("User does not exist", 400);
        }
        const user = yield user_model_1.User.findOne({ email: decoded.email });
        if (!user) {
            throw new AppError_1.default(`${decoded.email} does not exist`, 400);
        }
        if (user.isBlocked) {
            throw new AppError_1.default(`${decoded.email} is blocked`, 403);
        }
        const wallet = yield wallet_model_1.Wallet.findOne({ user: user._id });
        if (!wallet) {
            throw new AppError_1.default(`${decoded.email} wallet not found`, 400);
        }
        if (wallet.isBlocked) {
            throw new AppError_1.default(`${decoded.email} Wallet is blocked`, 403);
        }
        if (!authRoles.includes(decoded.role)) {
            throw new Error("You are not permitted to access this route");
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.checkAuth = checkAuth;
