// external imports
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

// internal imports
import { envVars } from "../config/env";
import { verifyToken } from "../../utils/jwt";
import AppError from "../errorHelpers/AppError";
import { User } from "../modules/user/user.model";
import { Wallet } from "../modules/wallet/wallet.model";

/**
 * A middleware to check if the user is authenticated and has the required roles to access the route
 * @param  {...string[]} authRoles - The roles that are allowed to access the route
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<void>}
 */
export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization;
    try {
      const decoded = verifyToken(accessToken as string, envVars.JWT_SECRET) as JwtPayload;

      const isUserExist = await User.findOne({ email: decoded.email });

      if (!isUserExist) {
        throw new AppError("User does not exist", 400);
      }

      const user = await User.findOne({ email: decoded.email });

      if (!user) {
        throw new AppError(`${decoded.email} does not exist`, 400);
      }

      if (user.isBlocked) {
        throw new AppError(`${decoded.email} is blocked`, 403);
      }

      const wallet = await Wallet.findOne({ user: user._id });
      if (!wallet) {
        throw new AppError(`${decoded.email} wallet not found`, 400);
      }

      if (wallet.isBlocked) {
        throw new AppError(`${decoded.email} Wallet is blocked`, 403);
      }

      if (!authRoles.includes(decoded.role)) {
        throw new Error("You are not permitted to access this route");
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
