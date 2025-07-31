// external imports
import { NextFunction, Request, Response } from "express";
// internal imports
import { authService } from "./auth.service";
import { sendResponse } from "../../../utils/sendResponse";

/**
 * authController 
 * @description This controller is used to create user, login user, create agent
 */

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.createUser(req.body, res, next);
    sendResponse(res, 200, "User created successfully", result);
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body, res, next);
    sendResponse(res, 200, "User logged in successfully", result);
  } catch (error) {
    next(error);
  }
};

const createAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.body?.userId;
    const result = await authService.createAgent(userId);
    sendResponse(res, 200, "Agent created successfully", result);
  } catch (error) {
    next(error);
  }
};

export const authController = {
  createUser,
  login,
  createAgent,
};
