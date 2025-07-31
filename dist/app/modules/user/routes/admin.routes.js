"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouters = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../../middlewares/checkAuth");
const user_interface_1 = require("../user.interface");
const user_controller_1 = require("../user.controller");
exports.adminRouters = (0, express_1.Router)();
// routes for admin
exports.adminRouters.get("/all", (0, checkAuth_1.checkAuth)(user_interface_1.IUserRole.admin), user_controller_1.userController.getAllData);
exports.adminRouters.patch("/wallets/:walletId", (0, checkAuth_1.checkAuth)(user_interface_1.IUserRole.admin), user_controller_1.userController.updateWalletStatus);
exports.adminRouters.patch("/agents/:agentId", (0, checkAuth_1.checkAuth)(user_interface_1.IUserRole.admin), user_controller_1.userController.updateAgentStatus);
