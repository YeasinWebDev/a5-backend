import { Router } from "express";
import { checkAuth } from "../../../middlewares/checkAuth";
import { IUserRole } from "../user.interface";
import { userController } from "../user.controller";

export const adminRouters = Router();

// routes for admin
adminRouters.get("/all", checkAuth(IUserRole.admin), userController.getAllData);
adminRouters.patch("/wallets/:walletId", checkAuth(IUserRole.admin), userController.updateWalletStatus);
adminRouters.patch("/agents/:agentId", checkAuth(IUserRole.admin), userController.updateAgentStatus);

