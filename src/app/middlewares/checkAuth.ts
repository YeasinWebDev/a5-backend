// external imports
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

// internal imports
import { envVars } from "../config/env";
import { verifyToken } from "../../utils/jwt";
import AppError from "../errorHelpers/AppError";
import { User } from "../modules/user/user.model";

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

      if (!authRoles.includes(decoded.role)) {
        throw new Error("You are not permitted to access this route");
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
