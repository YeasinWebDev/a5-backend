import { Request, Response } from "express";


/**
 * notFound
 * @description Handles 404 responses. This is a catch all
 *              middleware that should be placed at the end of
 *              the middleware stack.
 * @param {Request} req - The express request.
 * @param {Response} res - The express response.
 */
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
}