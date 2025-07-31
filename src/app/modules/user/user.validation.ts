import z from "zod";
import { IAgentStatus, IUserRole } from "./user.interface";

export const userCreateZodSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone number is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum([IUserRole.user, IUserRole.admin, IUserRole.agent]).optional().default(IUserRole.user),
  isBlocked: z.boolean().optional().default(false),
  agentStatus: z.enum([IAgentStatus.pending, IAgentStatus.approved, IAgentStatus.suspended]).optional().default(IAgentStatus.pending),
  commissionRate: z.number().min(0).max(1).optional().default(0.02),
  createdAt: z.date().optional(),
});

export const userUpdateZodSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  email: z.string().email({ message: "Invalid email address" }).optional(),
  phone: z.string().min(10, { message: "Phone number is required" }).optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
  role: z.enum([IUserRole.user, IUserRole.admin, IUserRole.agent]).optional(),
  isBlocked: z.boolean().optional(),
  agentStatus: z.enum([IAgentStatus.pending, IAgentStatus.approved, IAgentStatus.suspended]).optional(),
  commissionRate: z.number().min(0).max(1).optional(),
  createdAt: z.date().optional(),
});
