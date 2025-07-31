// jwt 
import { JwtPayload } from "jsonwebtoken";
// error 
import { commonError } from "../../errorHelpers/commonError";
import AppError from "../../errorHelpers/AppError";
// types 
import { ICashInAndOutMoney } from "../../types/userTypes";
// interfaces
import { ITransactionStatus, ITransactionType } from "../transaction/transaction.interface";
import { IAgentStatus, IUser } from "./user.interface";
// models
import { User } from "./user.model";
import { Transaction } from "../transaction/transaction.model";
import { Wallet } from "../wallet/wallet.model";

// for admin
const getAllData = async () => {
  const allUsers = await User.find({ role: "user" });
  const allAgents = await User.find({ role: "agent" });
  const allWallets = await Wallet.find({});
  const allTransactions = await Transaction.find({});
  return { allUsers, allAgents, allWallets, allTransactions };
};

const updateWalletStatus = async (walletId: string, status: boolean) => {
  const wallet = await Wallet.findOne({ user: walletId }).populate("user", "name");
  if (!wallet) {
    throw new AppError("Wallet not found", 400);
  }
  if(status === null || status === undefined) {
    throw new AppError("please provide status", 400);
  }
  wallet.isBlocked = status;
  await wallet.save();
  const walletData = {
    _id: wallet._id,
    userId: wallet.user._id,
    userName: (wallet.user as unknown as IUser).name,
    balance: wallet.balance,
    isBlocked: wallet.isBlocked,
  }
  return { wallet: walletData };
};

const updateAgentStatus = async (agentId: string, status: string) => {
  const agent = await User.findOne({ _id: agentId });
  let updateStatus;
  if (!agent) {
    throw new AppError("Agent not found", 400);
  }
  if(agent.role !== "agent") {
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
const cashInMoney = async (data: ICashInAndOutMoney, agent: JwtPayload) => {
  const { userId, amount } = data;
  const wallet = await Wallet.findOne({ user: userId });
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
    receiver: userId,
    receiverName: (wallet!.user as unknown as IUser).name,
    amount: amount,
    status: ITransactionStatus.completed,
    commission: 0,
  });
  console.log(transaction);
  return { wallet, transaction };
};

const cashOutMoney = async (data: ICashInAndOutMoney, agent: JwtPayload) => {
  const { userId, amount } = data;
  const wallet = await Wallet.findOne({ user: userId }).populate("user", "name");
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
    sender: userId,
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
  const wallet = await Wallet.findOne({ user: userId });
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
  const { userId, amount } = data;
  const wallet = await Wallet.findOne({ user: userId }).populate("user", "name");
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

const getTransactions = async (userId: string) => {
  const transactions = await Transaction.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .populate("sender", "name")
    .populate("receiver", "name")
    .sort({ createdAt: -1 });

  const transactionData = transactions.map((transaction) => {
    return {
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
    };
  });

  return { transactions: transactionData };
};

export const userService = {
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
  withdrawMoney,
  sendMoney,
  getTransactions,
};
