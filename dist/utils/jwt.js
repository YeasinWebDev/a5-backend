"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Generates a JSON Web Token (JWT) for a given payload.
 *
 * @param {JwtPayload} payload - The payload to include in the token.
 * @param {string} secret - The secret key to sign the token.
 * @param {string} expiresIn - The expiration time of the token (e.g., '1d', '2h').
 * @returns {string} The generated JWT as a string.
 */
const generateToken = (payload, secret, expiresIn) => {
    const token = jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn,
    });
    return token;
};
exports.generateToken = generateToken;
/**
 * Verifies a JSON Web Token (JWT) with a given secret key.
 *
 * @param {string} token - The JWT to verify.
 * @param {string} secret - The secret key to verify the token.
 * @returns {JwtPayload} The verified token payload.
 */
const verifyToken = (token, secret) => {
    const verifiedToken = jsonwebtoken_1.default.verify(token, secret);
    return verifiedToken;
};
exports.verifyToken = verifyToken;
