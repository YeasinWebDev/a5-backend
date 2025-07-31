"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
/**
 * sendResponse
 * @description Sends a JSON response with a specified status code, message, and data.
 * @param {Response} res - The Express response object.
 * @param {string} message - A message to include in the response.
 * @param {unknown} data - The data to include in the response.
 */
const sendResponse = (res, statusCode, message, data) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.sendResponse = sendResponse;
