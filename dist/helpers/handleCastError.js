"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCastError = void 0;
/**
 * Handles MongoDB CastError.
 *
 * @param err - The CastError object from mongoose containing the error details.
 * @returns An object containing the status code and a message indicating the invalid ObjectID error.
 */
const handleCastError = (err) => {
    return {
        statusCode: 400,
        message: "Invalid MongoDB ObjectID. Please provide a valid id",
    };
};
exports.handleCastError = handleCastError;
