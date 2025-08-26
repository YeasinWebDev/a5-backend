"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentRouters = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../../middlewares/checkAuth");
const user_controller_1 = require("../user.controller");
const user_interface_1 = require("../user.interface");
exports.agentRouters = (0, express_1.Router)();
// routes for agent
exports.agentRouters.get("/commissions", (0, checkAuth_1.checkAuth)(user_interface_1.IUserRole.agent), user_controller_1.userController.getCommissions);
exports.agentRouters.post("/cash-in", (0, checkAuth_1.checkAuth)(user_interface_1.IUserRole.agent), user_controller_1.userController.cashInMoney);
exports.agentRouters.post("/cash-out", (0, checkAuth_1.checkAuth)(user_interface_1.IUserRole.agent), user_controller_1.userController.cashOutMoney);
exports.agentRouters.get("/transactions", (0, checkAuth_1.checkAuth)(user_interface_1.IUserRole.agent), user_controller_1.userController.getAgentTransactions);
exports.agentRouters.get("/stats", (0, checkAuth_1.checkAuth)(user_interface_1.IUserRole.agent), user_controller_1.userController.getAgentStats);
