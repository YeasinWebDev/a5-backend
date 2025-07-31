"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAgentStatus = exports.IUserRole = void 0;
var IUserRole;
(function (IUserRole) {
    IUserRole["user"] = "user";
    IUserRole["admin"] = "admin";
    IUserRole["agent"] = "agent";
})(IUserRole || (exports.IUserRole = IUserRole = {}));
var IAgentStatus;
(function (IAgentStatus) {
    IAgentStatus["pending"] = "pending";
    IAgentStatus["approved"] = "approved";
    IAgentStatus["suspended"] = "suspended";
})(IAgentStatus || (exports.IAgentStatus = IAgentStatus = {}));
