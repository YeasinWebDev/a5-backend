import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import { sendResponse } from "../../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";

// for admin
const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.getStats();
    sendResponse(res, 200, "Stats fetched successfully", result);
  } catch (error) {
    next(error);
  }
};
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query;
    const result = await userService.getAllUsers(query);
    sendResponse(res, 200, "Users fetched successfully", result);
  } catch (error) {
    next(error);
  }
};
const getAllData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query;
    const result = await userService.getAllData(query);
    sendResponse(res, 200, "Data fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const status = req.body.status;
    const result = await userService.updateUserStatus(userId, status);
    sendResponse(res, 200, "Wallet status updated successfully", result);
  } catch (error) {
    next(error);
  }
};

const updateAgentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agentId = req.params.agentId;
    const status = req.body.status;
    const result = await userService.updateAgentStatus(agentId, status);
    sendResponse(res, 200, "Agent status updated successfully", result);
  } catch (error) {
    next(error);
  }
};

// for agent
const getAgentStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = req.user;
    const result = await userService.getAgentStats(agent);
    sendResponse(res, 200, "Agent stats fetched successfully", result);
  } catch (error) {
    next(error);
  }
};
const cashInMoney = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const agent = req.user;
    if (!data?.email || !data?.amount) {
      throw new Error("User email and amount is required");
    }
    const result = await userService.cashInMoney(data, agent);
    sendResponse(res, 200, "Cash in successfully", result);
  } catch (error) {
    next(error);
  }
};

const cashOutMoney = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const agent = req.user;
    if (!data?.email || !data?.amount) {
      throw new Error("User email and amount is required");
    }
    const result = await userService.cashOutMoney(data, agent);
    sendResponse(res, 200, "Cash out successfully", result);
  } catch (error) {
    next(error);
  }
};

const getCommissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = req.user;
    const result = await userService.getCommissions(agent);
    sendResponse(res, 200, "Commissions retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};
const getAgentTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query;
    const result = await userService.getAgentTransactions(req.user.userId, query);
    sendResponse(res, 200, "Transactions retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

// for user
const addMoney = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const result = await userService.addMoney(data);
    sendResponse(res, 200, "Money added successfully", result);
  } catch (error) {
    next(error);
  }
};

const withdrawMoney = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const result = await userService.withdrawMoney(data);
    sendResponse(res, 200, "withdraw Money successfully", result);
  } catch (error) {
    next(error);
  }
};

const sendMoney = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const sender = req.user;
    if (!data?.email || !data?.amount) {
      throw new AppError("User email and amount is required", 500);
    }
    const result = await userService.sendMoney(data, sender);
    sendResponse(res, 200, "Send Money successfully", result);
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query;
    const result = await userService.getTransactions(req.user.userId, query);
    sendResponse(res, 200, "Transactions retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

const searchUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.query;
    const result = await userService.searchUser(query as string);
    sendResponse(res, 200, "User found successfully", result);
  } catch (error) {
    console.log(error, "error");
    next(error);
  }
};

export const userController = {
  // admin
  getStats,
  getAllUsers,
  getAllData,
  updateUserStatus,
  updateAgentStatus,
  // agent
  getAgentStats,
  cashInMoney,
  cashOutMoney,
  getCommissions,
  getAgentTransactions,
  // user
  addMoney,
  sendMoney,
  withdrawMoney,
  getTransactions,
  searchUser,
};
