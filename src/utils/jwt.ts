import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";


/**
 * Generates a JSON Web Token (JWT) for a given payload.
 *
 * @param {JwtPayload} payload - The payload to include in the token.
 * @param {string} secret - The secret key to sign the token.
 * @param {string} expiresIn - The expiration time of the token (e.g., '1d', '2h').
 * @returns {string} The generated JWT as a string.
 */

export const generateToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: string
) => {
  const token = jwt.sign(payload, secret, {
    expiresIn,
  } as SignOptions);

  return token;
};


/**
 * Verifies a JSON Web Token (JWT) with a given secret key.
 *
 * @param {string} token - The JWT to verify.
 * @param {string} secret - The secret key to verify the token.
 * @returns {JwtPayload} The verified token payload.
 */
export const verifyToken = (token: string, secret: string) => {
  const verifiedToken = jwt.verify(token, secret);

  return verifiedToken;
};