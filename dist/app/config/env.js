"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envVars = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Loads and validates required environment variables from the process environment.
 * Throws an error if any required environment variable is missing.
 *
 * @returns {EnvConfig} An object containing the loaded environment variables.
 */
const loadEnvVariables = () => {
    const requiredEnvVariables = ["PORT", "DB_URL", "JWT_SECRET"];
    requiredEnvVariables.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`Missing require environment variable ${key}`);
        }
    });
    return {
        PORT: process.env.PORT,
        DB_URL: process.env.DB_URL,
        JWT_SECRET: process.env.JWT_SECRET,
    };
};
exports.envVars = loadEnvVariables();
