import mongoose from "mongoose";
import { ITransaction, ITransactionStatus, ITransactionType } from "./transaction.interface";

const transactionSchema = new mongoose.Schema<ITransaction>({
  type: {
    type: String,
    enum: Object.values(ITransactionType) as string[],
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  senderName:{
    type: String
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  receiverName:{
    type: String
  },
  amount: {
    type: Number,
    required: true,
  },
  commission: {
    type: Number,
  },
  status: {
    type: String,
    enum: Object.values(ITransactionStatus) as string[],
    default: ITransactionStatus.pending,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true, versionKey: false });

export const Transaction = mongoose.model<ITransaction>("Transaction", transactionSchema);
