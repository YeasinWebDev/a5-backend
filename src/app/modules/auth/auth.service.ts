// external imports
import { NextFunction, Response } from "express";
import bcrypt from "bcryptjs";
// internal imports
import AppError from "../../errorHelpers/AppError";
import { IAgentStatus, IUser } from "../user/user.interface";
import { createToken } from "../../../utils/userToken";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import { generateToken, verifyToken } from "../../../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";

interface IProfile {
  name?: string;
  phone?: string;
  oldPassword?: string;
  newPassword?: string;
}

/**
 * auth services
 *
 * @description This service is used to create user, login user
 */

const createUser = async (body: Partial<IUser>, res: Response, next: NextFunction) => {
  const existingEmailUser = await User.findOne({ email: body.email });
  if (existingEmailUser) {
    throw new AppError("Email already exists", 400);
  }

  const existingPhoneUser = await User.findOne({ phone: body.phone });
  if (existingPhoneUser) {
    throw new AppError("Phone number already exists", 400);
  }

  const hashPassword = await bcrypt.hash(body.password!, 10);
  body.password = hashPassword;

  if(body.role === "agent") {
    body.agentStatus = IAgentStatus.approved
  }

  const user = await User.create(body);

  await Wallet.create({ user: user._id });

  const token = createToken(user);
  res.cookie("accessToken", token.accessToken, {
    httpOnly: true,
    secure: true,
  });
  res.cookie("refreshToken", token.refreshToken, {
    httpOnly: true,
    secure: true,
  });

  return user;
};

const login = async (body: Partial<IUser>, res: Response, next: NextFunction) => {
  const user = await User.findOne({ email: body.email });
  if (!user) {
    throw new AppError("Invalid email or password", 400);
  }
  const isPasswordMatch = await bcrypt.compare(body.password!, user.password!);

  if (!isPasswordMatch) {
    throw new AppError("Invalid email or password", 400);
  }

  const token = createToken(user);

  res.cookie("accessToken", token.accessToken, {
    httpOnly: true,
    secure: true,
  });
  res.cookie("refreshToken", token.refreshToken, {
    httpOnly: true,
    secure: true,
  });
  return { user, accessToken: token.accessToken, refreshToken: token.refreshToken };
};

const refreshToken = async (refreshToken: string) => {
  const verfiyRefreshToken = verifyToken(refreshToken, envVars.JWT_SECRET) as JwtPayload;

  if (!verfiyRefreshToken) {
    throw new Error("Invalid Refresh Token");
  }
  const isUserExist = await User.findOne({
    email: verfiyRefreshToken.email,
  });
  if (!isUserExist) {
    throw new Error("User Not Found");
  }
  const userPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const accessToken = generateToken(userPayload, envVars.JWT_SECRET, "1d");

  return { accessToken };
};

const profileUpdate = async (user: JwtPayload, body: IProfile) => {
  const { name, phone, oldPassword, newPassword } = body;
  const isUserExist = await User.findOne({
    email: user.email,
  });

  if (!isUserExist) {
    throw new AppError("User Not Found", 400);
  }

  if (oldPassword) {
    const passowrdMatch = await bcrypt.compare(oldPassword, isUserExist.password);

    if (!passowrdMatch) {
      throw new AppError("Invalid Old Password", 400);
    }
    if (!newPassword) {
      throw new AppError("New Password is required", 400);
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    isUserExist.password = hashPassword;
  }

  if (name) {
    isUserExist.name = name;
  }

  if (phone) {
    const existingPhoneUser = await User.findOne({ phone });
    if (existingPhoneUser) {
      throw new AppError("Phone number already exists", 400);
    }
    isUserExist.phone = phone;
  }

  await isUserExist.save();
  return isUserExist;
};

const me = async (decodedToken: JwtPayload) => {
  const user = await User.findById(decodedToken.userId);
  if (!user) {
    throw new Error("User Not Found");
  }
  const wallet = await Wallet.findOne({ user: user._id });
  return { user, balance: wallet!.balance };
};

export const authService = {
  createUser,
  login,
  refreshToken,
  me,
  profileUpdate,
};
