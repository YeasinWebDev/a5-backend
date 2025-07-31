import { Response } from "express";

/**
 * sendResponse
 * @description Sends a JSON response with a specified status code, message, and data.
 * @param {Response} res - The Express response object.
 * @param {string} message - A message to include in the response.
 * @param {unknown} data - The data to include in the response.
 */
export const sendResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: unknown,
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
