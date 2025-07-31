import mongoose from "mongoose";
import { IAgentStatus, IUser, IUserRole } from "./user.interface";

export const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: Object.values(IUserRole),
      default: IUserRole.user,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    agentStatus: {
      type: String,
      enum: Object.values(IAgentStatus),
      default: IAgentStatus.pending,
    },
    commissionRate: {
      type: Number,
      default: 0.02,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = mongoose.model<IUser>("User", userSchema);
