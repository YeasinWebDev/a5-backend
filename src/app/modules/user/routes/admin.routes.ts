import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { IUserRole } from "../user.interface";
import { userController } from "../user.controller";

export const adminRouters = Router();

// routes for admin
adminRouters.get("/stats", checkAuth(IUserRole.admin), userController.getStats);
adminRouters.get("/allData", checkAuth(IUserRole.admin), userController.getAllData);
adminRouters.patch("/user/:userId", checkAuth(IUserRole.admin), userController.updateUserStatus);
adminRouters.patch("/agent/:agentId", checkAuth(IUserRole.admin), userController.updateAgentStatus);

adminRouters.get("/allUsers", checkAuth(IUserRole.admin), userController.getAllUsers);