import mongoose, { Schema } from "mongoose";
import { IWallet } from "./wallet.interface";

const WalletSchema: Schema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 50,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);