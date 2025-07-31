"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.userSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_interface_1 = require("./user.interface");
exports.userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    role: {
        type: String,
        enum: Object.values(user_interface_1.IUserRole),
        default: user_interface_1.IUserRole.user,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    agentStatus: {
        type: String,
        enum: Object.values(user_interface_1.IAgentStatus),
        default: user_interface_1.IAgentStatus.pending,
    },
    commissionRate: {
        type: Number,
        default: 0.02,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.User = mongoose_1.default.model("User", exports.userSchema);
