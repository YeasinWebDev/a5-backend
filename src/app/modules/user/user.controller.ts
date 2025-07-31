import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import { sendResponse } from "../../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";

// for admin 
const getAllData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.getAllData();
    sendResponse(res, 200, "Data fetched successfully", result);
  } catch (error) {
    next(error);
  }
}

const updateWalletStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const walletId = req.params.walletId;
    const status = req.body.status;
    const result = await userService.updateWalletStatus(walletId, status);
    sendResponse(res, 200, "Wallet status updated successfully", result);
  } catch (error) {
    next(error);
  }
}

const updateAgentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agentId = req.params.agentId;
    const status = req.body.status;
    const result = await userService.updateAgentStatus(agentId, status);
    sendResponse(res, 200, "Agent status updated successfully", result);
  } catch (error) {
    next(error);
  }
}

// for agent
const cashInMoney = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const agent = req.user;
    if (!data?.userId || !data?.amount) {
      throw new Error("User id and amount is required");
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
    if (!data?.userId || !data?.amount) {
      throw new Error("User id and amount is required");
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
}

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
    if (!data?.userId || !data?.amount) {
      throw new AppError("User id and amount is required", 500);
    }
    const result = await userService.sendMoney(data, sender);
    sendResponse(res, 200, "Send Money successfully", result);
  } catch (error) {
    next(error);
  }
};

const getTransactions = async(req: Request, res: Response,next: NextFunction) => {
  try {
    const result = await userService.getTransactions(req.user.userId);  
    sendResponse(res, 200, "Transactions retrieved successfully", result);
  } catch (error) {
    next(error)
  }
};

export const userController = {
  // admin
  getAllData,
  updateWalletStatus,
  updateAgentStatus,
  // agent
  cashInMoney,
  cashOutMoney,
  getCommissions,
  // user
  addMoney,
  sendMoney,
  withdrawMoney,
  getTransactions,
};
