// external imports
import { Router } from "express";
// internal imports
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { authController } from "./auth.controller";
import { userCreateZodSchema } from "../user/user.validation";
import { IUserRole } from "../user/user.interface";

export const authRouters= Router()

authRouters.post("/login",authController.login)
authRouters.post("/create",validateRequest(userCreateZodSchema) ,authController.createUser)

authRouters.post("/create-agent",checkAuth(IUserRole.admin),authController.createAgent)