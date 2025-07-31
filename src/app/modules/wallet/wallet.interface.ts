import mongoose from "mongoose";

export interface IWallet {
  user: mongoose.Types.ObjectId;
  balance: number;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}