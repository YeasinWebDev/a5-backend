import mongoose from "mongoose"

export enum ITransactionType{
    topUp = "topUp",
    withdraw = "withdraw",
    send = "send",
    cashIn = "cash-in",
    cashOut = "cash-out"
}

export enum ITransactionStatus{
    pending = "pending",
    completed = "completed",
    failed = "failed"
}

export interface ITransaction{
    type: ITransactionType
    sender?:mongoose.Types.ObjectId
    senderName?:string
    receiver?:mongoose.Types.ObjectId
    receiverName?:string
    amount:number
    commission?:number
    status:ITransactionStatus
    createdAt:Date
    updatedAt:Date
}