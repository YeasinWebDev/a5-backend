"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userUpdateZodSchema = exports.userCreateZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.userCreateZodSchema = zod_1.default.object({
    name: zod_1.default.string().min(1, { message: "Name is required" }),
    email: zod_1.default.string().email({ message: "Invalid email address" }),
    phone: zod_1.default.string().min(10, { message: "Phone number is required" }),
    password: zod_1.default.string().min(6, { message: "Password must be at least 6 characters" }),
    role: zod_1.default.enum([user_interface_1.IUserRole.user, user_interface_1.IUserRole.agent]).optional().default(user_interface_1.IUserRole.user),
    isBlocked: zod_1.default.boolean().optional().default(false),
    agentStatus: zod_1.default.enum([user_interface_1.IAgentStatus.pending, user_interface_1.IAgentStatus.approved, user_interface_1.IAgentStatus.suspended]).optional().default(user_interface_1.IAgentStatus.pending),
    commissionRate: zod_1.default.number().min(0).max(1).optional().default(0.02),
    createdAt: zod_1.default.date().optional(),
});
exports.userUpdateZodSchema = zod_1.default.object({
    name: zod_1.default.string().min(1, { message: "Name is required" }).optional(),
    email: zod_1.default.string().email({ message: "Invalid email address" }).optional(),
    phone: zod_1.default.string().min(10, { message: "Phone number is required" }).optional(),
    password: zod_1.default.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
    role: zod_1.default.enum([user_interface_1.IUserRole.user, user_interface_1.IUserRole.agent]).optional(),
    isBlocked: zod_1.default.boolean().optional(),
    agentStatus: zod_1.default.enum([user_interface_1.IAgentStatus.pending, user_interface_1.IAgentStatus.approved, user_interface_1.IAgentStatus.suspended]).optional(),
    commissionRate: zod_1.default.number().min(0).max(1).optional(),
    createdAt: zod_1.default.date().optional(),
});
