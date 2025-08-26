// jwt
import { JwtPayload } from "jsonwebtoken";
// error
import { commonError } from "../../errorHelpers/commonError";
import AppError from "../../errorHelpers/AppError";
// types
import { ICashInAndOutMoney } from "../../types/userTypes";
// interfaces
import { ITransactionStatus, ITransactionType } from "../transaction/transaction.interface";
import { IAgentStatus, IUser, IUserRole } from "./user.interface";
// models
import { User } from "./user.model";
import { Transaction } from "../transaction/transaction.model";
import { Wallet } from "../wallet/wallet.model";
import mongoose, { FilterQuery, Types } from "mongoose";

interface QueryParams {
  page?: number;
  limit?: number;
  type?: "send" | "withdraw" | "topUp";
  startDate?: string;
  endDate?: string;
  role?: string;
  status?: string;
  minAmount?: string;
  maxAmount?: string;
  search?: string;
}

// for admin
const getStats = async () => {
  const totalUsers = await User.countDocuments({ role: "user" });
  const totalAgents = await User.countDocuments({ role: "agent" });
  const totalTransactions = await Transaction.countDocuments({});
  const totalTransactionsMoney = await Transaction.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);

  const userPieChartData = await User.aggregate([
    { $match: { role: { $ne: "admin" } } },
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        role: "$_id",
        count: 1,
      },
    },
  ]);

  const typeBarChartData = await Transaction.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        type: "$_id",
        count: 1,
      },
    },
  ]);


  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const transactionVolume7Days = await Transaction.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        volume: { $sum: "$amount" },
        firstCreatedAt: { $first: "$createdAt" }, 
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const resultWithDayName = transactionVolume7Days.map((item) => ({
    ...item,
    dayName: weekDays[item.firstCreatedAt.getDay()].slice(0, 3),
  }));

  
  return {
    totalUsers,
    totalAgents,
    totalTransactions,
    totalVolume: totalTransactionsMoney[0]?.total,
    userPieChartData,
    typeBarChartData,
    transactionVolume7Days: resultWithDayName,
  };
};
const getAllUsers = async (query: QueryParams) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const role = query.role;

  const result = await User.find({ role: role }).select("-password").skip(skip).limit(limit);

  const total = await User.countDocuments({ role: role });
  return {
    data: result,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getAllData = async (query: QueryParams) => {
  const { page = 1, limit = 10, type, status, minAmount, maxAmount, search } = query;

  const filter: any = {};

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) filter.amount.$gte = Number(minAmount);
    if (maxAmount) filter.amount.$lte = Number(maxAmount);
  }

  const pipeLine: any[] = [
    { $match: filter },
    { $lookup: { from: "users", localField: "sender", foreignField: "_id", as: "sender" } },
    { $unwind: "$sender" },
    { $lookup: { from: "users", localField: "receiver", foreignField: "_id", as: "receiver" } },
    { $unwind: "$receiver" },
  ];

  if (search) {
    pipeLine.push({
      $match: {
        $or: [{ senderName: { $regex: search, $options: "i" } }, { receiverName: { $regex: search, $options: "i" } }],
      },
    });
  }

  const transactions = await Transaction.aggregate([...pipeLine, { $sort: { createdAt: -1 } }, { $skip: (page - 1) * limit }, { $limit: Number(limit) }]);

  const countResult = await Transaction.aggregate([...pipeLine, { $count: "count" }]);

  const total = countResult[0]?.count || 0;

  const transactionData = transactions.map((transaction) => ({
    _id: transaction._id,
    type: transaction.type,
    sender: transaction.sender?._id,
    senderName: (transaction.sender as unknown as IUser)?.name,
    receiver: transaction.receiver?._id,
    receiverName: (transaction.receiver as unknown as IUser)?.name,
    amount: transaction.amount,
    status: transaction.status,
    commission: transaction.commission,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  }));

  return { transactionData, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const updateUserStatus = async (userId: string, status: boolean) => {
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new AppError("User not found", 400);
  }
  console.log(userId, status);
  user.isBlocked = status;
  await user.save();
  return { user };
};

const updateAgentStatus = async (agentId: string, status: string) => {
  const agent = await User.findOne({ _id: agentId });
  let updateStatus;
  if (!agent) {
    throw new AppError("Agent not found", 400);
  }
  if (agent.role !== "agent") {
    throw new AppError("User is not an agent", 400);
  }
  if (status === "approved") {
    updateStatus = IAgentStatus.approved;
  } else if (status === "suspend") {
    updateStatus = IAgentStatus.suspended;
  } else {
    throw new AppError("Invalid status. status only can be approved or suspend or pending", 400);
  }

  agent.agentStatus = updateStatus;
  await agent.save();
  return { agent };
};

// for agent
const getAgentStats = async (agent: JwtPayload) => {
  const receiverId = new mongoose.Types.ObjectId(String(agent.userId));
  const senderId = new mongoose.Types.ObjectId(String(agent.userId));
  const userBalance = await Wallet.findOne({ user: agent.userId });
  const totalCashIn = await Transaction.aggregate([
    {
      $match: {
        $or: [{ receiver: receiverId }, { sender: senderId }],
        type: "cash-in",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);
  const totalCashOut = await Transaction.aggregate([
    {
      $match: {
        $or: [{ receiver: receiverId }, { sender: senderId }],
        type: "cash-out",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);
  const totalCommission = await Transaction.aggregate([
    {
      $match: {
        $or: [{ receiver: receiverId }, { sender: senderId }],
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$commission" },
      },
    },
  ]);
  const recentTransactions = await Transaction.find({ $or: [{ receiver: receiverId }, { sender: senderId }] })
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    balance: userBalance!.balance,
    totalCashIn: totalCashIn[0]?.total || 0,
    totalCashOut: totalCashOut[0]?.total || 0,
    totalCommission: totalCommission[0]?.total || 0,
    recentTransactions,
  };
};

const cashInMoney = async (data: ICashInAndOutMoney, agent: JwtPayload) => {
  const { email, amount } = data;
  const user = await User.findOne({ email });
  const wallet = await Wallet.findOne({ user: user?._id }).populate("user", "name");
  const agentWallet = await Wallet.findOne({ user: agent.userId }).populate("user", "name");

  commonError(wallet, "User");
  commonError(agentWallet, "Agent");

  if (agentWallet!.balance < amount) {
    throw new Error("Agent does not have enough balance");
  }

  wallet!.balance += amount;
  agentWallet!.balance -= amount;

  await wallet!.save();
  await agentWallet!.save();

  const transaction = await Transaction.create({
    type: ITransactionType.cashIn,
    sender: agent.userId,
    senderName: (agentWallet!.user as unknown as IUser).name,
    receiver: user?._id,
    receiverName: (wallet!.user as unknown as IUser).name,
    amount: amount,
    status: ITransactionStatus.completed,
    commission: 0,
  });
  return { wallet, transaction };
};

const cashOutMoney = async (data: ICashInAndOutMoney, agent: JwtPayload) => {
  const { email, amount } = data;
  const user = await User.findOne({ email });
  const wallet = await Wallet.findOne({ user: user?._id }).populate("user", "name");
  const agentWallet = await Wallet.findOne({ user: agent.userId }).populate("user", "name");

  commonError(wallet, "User");
  commonError(agentWallet, "Agent");

  const commission = Number(amount * 0.02);

  if (wallet!.balance < commission + amount) {
    throw new Error(`User does not have enough balance . Commission is ${commission}. user balance is ${wallet!.balance}`);
  }

  wallet!.balance -= commission;
  wallet!.balance -= amount;
  agentWallet!.balance += amount;

  await wallet!.save();
  await agentWallet!.save();

  const transaction = await Transaction.create({
    type: ITransactionType.cashOut,
    sender: user?._id,
    senderName: (wallet!.user as unknown as IUser).name,
    receiver: agent.userId,
    receiverName: (agentWallet!.user as unknown as IUser).name,
    amount: amount,
    status: ITransactionStatus.completed,
    commission: commission,
  });

  return { wallet, transaction };
};

const getCommissions = async (agent: JwtPayload) => {
  const transactions = await Transaction.find({ receiver: agent.userId }).sort({ createdAt: -1 }).populate("sender", "name").populate("receiver", "name");
  const transactionData = transactions.map((transaction) => {
    return {
      _id: transaction._id,
      type: transaction.type,
      sender: transaction.sender?._id,
      senderName: (transaction.sender as unknown as IUser).name,
      receiver: transaction.receiver?._id,
      receiverName: (transaction.receiver as unknown as IUser).name,
      amount: transaction.amount,
      commission: transaction.commission,
      status: transaction.status,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  });

  return { transactions: transactionData };
};

export const getAgentTransactions = async (userId: string, query: QueryParams) => {
  const { page = 1, limit = 10 } = query;

  const filter: FilterQuery<typeof Transaction> = {
    $or: [{ sender: new Types.ObjectId(userId) }, { receiver: new Types.ObjectId(userId) }],
  };

  const total = await Transaction.countDocuments(filter);

  const transactions = await Transaction.find(filter || {})
    .populate("sender", "name")
    .populate("receiver", "name")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const transactionData = transactions.map((transaction) => ({
    _id: transaction._id,
    type: transaction.type,
    sender: transaction.sender?._id,
    senderName: (transaction.sender as unknown as IUser)?.name,
    receiver: transaction.receiver?._id,
    receiverName: (transaction.receiver as unknown as IUser)?.name,
    amount: transaction.amount,
    status: transaction.status,
    commission: transaction.commission,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  }));

  return {
    transactions: transactionData,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// for user
const addMoney = async (data: ICashInAndOutMoney) => {
  const { userId, amount } = data;
  const wallet = await Wallet.findOne({ user: userId }).populate("user", "name");
  commonError(wallet, "User");
  wallet!.balance += amount;
  await wallet!.save();

  const transaction = await Transaction.create({
    type: ITransactionType.topUp,
    sender: userId,
    senderName: (wallet!.user as unknown as IUser).name,
    receiver: userId,
    receiverName: (wallet!.user as unknown as IUser).name,
    amount: amount,
    status: ITransactionStatus.completed,
    commission: 0,
  });

  const walletData = {
    _id: wallet!._id,
    user: (wallet!.user as unknown as IUser).name,
    balance: wallet!.balance,
    isBlocked: wallet!.isBlocked,
    createdAt: wallet!.createdAt,
    updatedAt: wallet!.updatedAt,
  };

  return { wallet: walletData, transaction };
};

const withdrawMoney = async (data: ICashInAndOutMoney) => {
  const { userId, amount } = data;
  const wallet = await Wallet.findOne({ user: userId }).populate("user", "name");
  commonError(wallet, "User");
  if (wallet!.balance < amount) {
    throw new Error("User does not have enough balance");
  }
  wallet!.balance -= amount;
  await wallet!.save();

  const transaction = await Transaction.create({
    type: ITransactionType.withdraw,
    sender: userId,
    senderName: (wallet!.user as unknown as IUser).name,
    receiver: userId,
    receiverName: (wallet!.user as unknown as IUser).name,
    amount: amount,
    status: ITransactionStatus.completed,
    commission: 0,
  });

  const walletData = {
    _id: wallet!._id,
    user: (wallet!.user as unknown as IUser).name,
    balance: wallet!.balance,
    isBlocked: wallet!.isBlocked,
    createdAt: wallet!.createdAt,
    updatedAt: wallet!.updatedAt,
  };

  return { wallet: walletData, transaction };
};

const sendMoney = async (data: ICashInAndOutMoney, sender: JwtPayload) => {
  const { email, amount } = data;
  const user = await User.findOne({ email });
  const wallet = await Wallet.findOne({ user: user?._id }).populate("user", "name");
  const senderWallet = await Wallet.findOne({ user: sender.userId }).populate("user", "name");
  commonError(wallet, "User");
  commonError(senderWallet, "Sender");
  if (wallet!.balance < amount) {
    throw new Error("User does not have enough balance");
  }
  senderWallet!.balance -= amount;
  wallet!.balance += amount;
  await wallet!.save();
  await senderWallet!.save();

  const transaction = await Transaction.create({
    type: ITransactionType.send,
    sender: sender.userId,
    senderName: (senderWallet!.user as unknown as IUser).name,
    receiver: user?._id,
    receiverName: (wallet!.user as unknown as IUser).name,
    amount: amount,
    status: ITransactionStatus.completed,
    commission: 0,
  });

  const walletData = {
    _id: wallet!._id,
    user: (wallet!.user as unknown as IUser).name,
    balance: wallet!.balance,
    isBlocked: wallet!.isBlocked,
    createdAt: wallet!.createdAt,
    updatedAt: wallet!.updatedAt,
  };

  return { wallet: walletData, transaction };
};

export const getTransactions = async (userId: string, query: QueryParams) => {
  const { page = 1, limit = 10, type, startDate, endDate } = query;

  const filter: FilterQuery<typeof Transaction> = {
    $or: [{ sender: new Types.ObjectId(userId) }, { receiver: new Types.ObjectId(userId) }],
  };

  if (type && (type === "send" || type === "withdraw" || type === "topUp" || type === "cash-in" || type === "cash-out" || type === "topUp")) {
    filter.type = type;
  }

  if (startDate && endDate && startDate !== "undefined" && endDate !== "undefined") {
    console.log("inside");
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }
  const total = await Transaction.countDocuments(filter);

  const transactions = await Transaction.find(filter || {})
    .populate("sender", "name")
    .populate("receiver", "name")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const transactionData = transactions.map((transaction) => ({
    _id: transaction._id,
    type: transaction.type,
    sender: transaction.sender?._id,
    senderName: (transaction.sender as unknown as IUser)?.name,
    receiver: transaction.receiver?._id,
    receiverName: (transaction.receiver as unknown as IUser)?.name,
    amount: transaction.amount,
    status: transaction.status,
    commission: transaction.commission,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  }));

  return {
    transactions: transactionData,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const searchUser = async (query: string) => {
  const users = await User.find({ email: { $regex: query, $options: "i" }, role: IUserRole.user });
  return { users };
};

export const userService = {
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
  withdrawMoney,
  sendMoney,
  getTransactions,
  searchUser,
};
