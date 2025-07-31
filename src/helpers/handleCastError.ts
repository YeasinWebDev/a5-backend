import mongoose from "mongoose";
import { TGenericErrorResponse } from "../app/interfaces/error.types";

/**
 * Handles MongoDB CastError.
 *
 * @param err - The CastError object from mongoose containing the error details.
 * @returns An object containing the status code and a message indicating the invalid ObjectID error.
 */

export const handleCastError = (
  err: mongoose.Error.CastError
): TGenericErrorResponse => {
  return {
    statusCode: 400,
    message: "Invalid MongoDB ObjectID. Please provide a valid id",
  };
};
