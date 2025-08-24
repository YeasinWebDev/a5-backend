"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouters = void 0;
// external imports
const express_1 = require("express");
// internal imports
const validateRequest_1 = require("../../middlewares/validateRequest");
const checkAuth_1 = require("../../middlewares/checkAuth");
const auth_controller_1 = require("./auth.controller");
const user_validation_1 = require("../user/user.validation");
const user_interface_1 = require("../user/user.interface");
exports.authRouters = (0, express_1.Router)();
exports.authRouters.post("/login", auth_controller_1.authController.login);
exports.authRouters.post("/create", (0, validateRequest_1.validateRequest)(user_validation_1.userCreateZodSchema), auth_controller_1.authController.createUser);
exports.authRouters.post("/logout", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.IUserRole)), auth_controller_1.authController.logout);
exports.authRouters.post('/refresh-token', auth_controller_1.authController.refreshToken);
exports.authRouters.get('/me', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.IUserRole)), auth_controller_1.authController.me);
exports.authRouters.post('/profile-update', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.IUserRole)), auth_controller_1.authController.profileUpdate);
