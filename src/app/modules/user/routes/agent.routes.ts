import { Router } from "express"
import { checkAuth } from "../../../middlewares/checkAuth"
import { userController } from "../user.controller"
import { IUserRole } from "../user.interface"


export const agentRouters = Router()

// routes for agent
agentRouters.get("/commissions",checkAuth(IUserRole.agent), userController.getCommissions)
agentRouters.post("/cash-in",checkAuth(IUserRole.agent), userController.cashInMoney)
agentRouters.post("/cash-out",checkAuth(IUserRole.agent), userController.cashOutMoney)