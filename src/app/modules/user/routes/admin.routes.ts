import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { IUserRole } from "../user.interface";
import { userController } from "../user.controller";

export const adminRouters = Router();

// routes for admin
adminRouters.get("/users", checkAuth(IUserRole.admin), userController.getAllData);
adminRouters.patch("/wallets/:walletId/status", checkAuth(IUserRole.admin), userController.updateWalletStatus);
adminRouters.patch("/agents/:agentId/status", checkAuth(IUserRole.admin), userController.updateAgentStatus);

