// external imports
import { NextFunction, Response } from "express";
import bcrypt from "bcryptjs";
// internal imports
import AppError from "../../errorHelpers/AppError";
import { IAgentStatus, IUser, IUserRole } from "../user/user.interface";
import { createToken } from "../../../utils/userToken";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";

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

  const user = await User.create(body);

  await Wallet.create({ user: user._id });

  const token = createToken(user);
  res.cookie("accessToken", token.accessToken, {
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
  return { user, token:token.accessToken };
};

const createAgent = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User does not exist", 400);
  }
  if (user.role === IUserRole.agent) {
    throw new AppError("User is already an agent", 400);
  }
  user.role = IUserRole.agent;
  user.agentStatus = IAgentStatus.approved;
  await user.save();
  return user;
};

export const authService = {
  createUser,
  createAgent,
  login,
};
