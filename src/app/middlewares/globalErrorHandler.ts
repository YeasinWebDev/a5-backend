// external imports
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
// types
import { TErrorSources } from "../interfaces/error.types";
// errors
import AppError from "../errorHelpers/AppError";
import { handlerDuplicateError } from "../../helpers/handleDuplicateError";
import { handleCastError } from "../../helpers/handleCastError";
import { handlerValidationError } from "../../helpers/handlerValidationError";
import { handleZodError } from "../../helpers/handleZodError";

export const globalErrorHandler = async (err: unknown,req: Request, res: Response, next:NextFunction) => {
  let errorSources: TErrorSources[] = [];
  let statusCode = 500;
  let message = "Something Went Wrong!!";

  if (typeof err === "object" && err !== null) {
    const error = err as { name?: string; code?: number; stack?: string; message?: string , statusCode?:number};

    if (error.code === 11000) {
      const simplifiedError = handlerDuplicateError(err);
      statusCode = simplifiedError.statusCode;
      message = simplifiedError.message;
    } else if (error.name === "CastError") {
      const simplifiedError = handleCastError(error as mongoose.Error.CastError);
      statusCode = simplifiedError.statusCode;
      message = simplifiedError.message;
    } else if (error.name === "ValidationError") {
      const simplifiedError = handlerValidationError(error as mongoose.Error.ValidationError);
      statusCode = simplifiedError.statusCode;
      errorSources = simplifiedError.errorSources as TErrorSources[];
      message = simplifiedError.message;
    } else if (error.name === "ZodError") {
      const simplifiedError = handleZodError(err);
      statusCode = simplifiedError.statusCode;
      errorSources = simplifiedError.errorSources as TErrorSources[];
      message = simplifiedError.message;
    } else if (err instanceof AppError) {
      statusCode = error.statusCode ?? 500;
      message = error.message ?? "Something Went Wrong!!";
    } else if (err instanceof Error) {
      message = error.message ?? "Something Went Wrong!!";
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
  });
};
