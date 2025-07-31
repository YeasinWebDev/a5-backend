import { TGenericErrorResponse } from "../app/interfaces/error.types";


/**
 * Handles MongoDB duplicate key errors. This function takes an error object
 * from a mongoose promise, and returns a generic error response object with
 * a 400 status code and a message indicating that the duplicate error occurred.
 * @param {object} err - The error object from a mongoose promise.
 * @returns {object} A generic error response object with a 400 status code and
 * a message indicating that the duplicate error occurred.
 */
export const handlerDuplicateError = (err: any): TGenericErrorResponse => {
  const matchedArray = err.message.match(/"([^"]*)"/);

  return {
    statusCode: 400,
    message: `${matchedArray[1]} already exists!!`,
  };
};
