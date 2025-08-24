// external imports
import { NextFunction, Request, Response } from "express";
// internal imports
import { authService } from "./auth.service";
import { sendResponse } from "../../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";

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
const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new Error("Refresh Token Not Found");
    }
    const result = await authService.refreshToken(refreshToken);
    sendResponse(res, 200, "User logged in successfully", result);
  } catch (error) {
    next(error);
  }
};

const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.me(req.user as JwtPayload);
    sendResponse(res, 200, "User logged in successfully", result);
  } catch (error) {
    next(error);
  }
};

const profileUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.profileUpdate(req.user as JwtPayload,req.body);
    sendResponse(res, 200, "Profile update  successfully", result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    sendResponse(res, 200, "Logout Successfully", {});
  } catch (error) {
    next(error);
  }
};

export const authController = {
  createUser,
  login,
  refreshToken,
  me,
  logout,
  profileUpdate,
};
