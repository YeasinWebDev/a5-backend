import { envVars } from "../app/config/env";
import { IUser } from "../app/modules/user/user.interface";
import { generateToken } from "./jwt";

/**
 * Creates a JWT token for a given user
 *
 * @param {Partial<IUser>} user - The user to create a token for
 * @returns {Promise<{accessToken: string}>} A promise that resolves with an object containing the JWT token
 */
export const createToken = (user: Partial<IUser>) => {
  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(jwtPayload, envVars.JWT_SECRET, "1d");

  return { accessToken };
};