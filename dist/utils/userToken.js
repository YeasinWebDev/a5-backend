"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = void 0;
const env_1 = require("../app/config/env");
const jwt_1 = require("./jwt");
/**
 * Creates a JWT token for a given user
 *
 * @param {Partial<IUser>} user - The user to create a token for
 * @returns {Promise<{accessToken: string}>} A promise that resolves with an object containing the JWT token
 */
const createToken = (user) => {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, jwt_1.generateToken)(jwtPayload, env_1.envVars.JWT_SECRET, env_1.envVars.ACCESS_EXPERIED);
    const refreshToken = (0, jwt_1.generateToken)(jwtPayload, env_1.envVars.JWT_SECRET, env_1.envVars.REFRESH_EXPERIED);
    return { accessToken, refreshToken };
};
exports.createToken = createToken;
