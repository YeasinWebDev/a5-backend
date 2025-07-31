"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouters = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../../middlewares/checkAuth");
const user_interface_1 = require("../user.interface");
const user_controller_1 = require("../user.controller");
exports.userRouters = (0, express_1.Router)();
// routes for user
exports.userRouters.get("/transactions", (0, checkAuth_1.checkAuth)(user_interface_1.IUserRole.user, user_interface_1.IUserRole.agent), user_controller_1.userController.getTransactions);
exports.userRouters.post("/add-money", (0, checkAuth_1.checkAuth)(user_interface_1.IUserRole.user, user_interface_1.IUserRole.agent), user_controller_1.userController.addMoney);
exports.userRouters.post("/withdraw", (0, checkAuth_1.checkAuth)(user_interface_1.IUserRole.user, user_interface_1.IUserRole.agent), user_controller_1.userController.withdrawMoney);
exports.userRouters.post("/send-money", (0, checkAuth_1.checkAuth)(user_interface_1.IUserRole.user, user_interface_1.IUserRole.agent), user_controller_1.userController.sendMoney);
