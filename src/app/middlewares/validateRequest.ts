// external imports
import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";


/**
 * Validates the request body against a given Zod schema.
 *
 * @param zodSchema - A ZodObject that defines the schema to validate against.
 *
 * @returns A middleware function that validates the request body against the given schema.
 *          If validation fails, the middleware calls `next` with the error.
 *          If validation succeeds, the middleware calls `next` without any arguments.
 */
export const validateRequest =
  (zodSchema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await zodSchema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
