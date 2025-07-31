"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlerValidationError = void 0;
/**
 * Handles mongoose validation errors. This function takes an error object from a mongoose promise and
 * returns a generic error response object with a 400 status code, a message indicating that a validation
 * error occurred, and an array of error sources. Each error source object contains the path and message
 * of the specific validation error.
 * @param {object} err - The error object from a mongoose promise.
 * @returns {object} A generic error response object with a 400 status code and an array of error sources.
 */
const handlerValidationError = (err) => {
    const errorSources = [];
    const errors = Object.values(err.errors);
    errors.forEach((errorObject) => errorSources.push({
        path: errorObject.path,
        message: errorObject.message,
    }));
    return {
        statusCode: 400,
        message: "Validation Error",
        errorSources,
    };
};
exports.handlerValidationError = handlerValidationError;
