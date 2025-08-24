import { Router } from "express"
import { checkAuth } from "../../../middlewares/checkAuth"
import { IUserRole } from "../user.interface"
import { userController } from "../user.controller"


export const userRouters = Router()

// routes for user
userRouters.get("/transactions",checkAuth(IUserRole.user, IUserRole.agent), userController.getTransactions)
userRouters.post("/add-money",checkAuth(IUserRole.user, IUserRole.agent), userController.addMoney)
userRouters.post("/withdraw",checkAuth(IUserRole.user, IUserRole.agent), userController.withdrawMoney)
userRouters.post("/send-money",checkAuth(IUserRole.user, IUserRole.agent), userController.sendMoney)
userRouters.get("/search",checkAuth(IUserRole.user, IUserRole.agent), userController.searchUser)