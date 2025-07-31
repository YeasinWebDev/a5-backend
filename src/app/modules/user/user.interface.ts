export enum IUserRole {
  user = "user",
  admin = "admin",
  agent = "agent",
}

export enum IAgentStatus {
  pending = "pending",
  approved = "approved",
  suspended = "suspended",
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: IUserRole;
  isBlocked: boolean;
  agentStatus?: IAgentStatus;
  commissionRate?: number;
  createdAt?: Date;
}
