"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
/**
 * notFound
 * @description Handles 404 responses. This is a catch all
 *              middleware that should be placed at the end of
 *              the middleware stack.
 * @param {Request} req - The express request.
 * @param {Response} res - The express response.
 */
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
};
exports.notFound = notFound;
