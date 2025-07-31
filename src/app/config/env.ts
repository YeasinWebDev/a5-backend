import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: string;
  DB_URL: string;
  JWT_SECRET: string;
}

/**
 * Loads and validates required environment variables from the process environment.
 * Throws an error if any required environment variable is missing.
 * 
 * @returns {EnvConfig} An object containing the loaded environment variables.
 */

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariables: string[] = ["PORT", "DB_URL", "JWT_SECRET"];

  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing require environment variable ${key}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
  };
};
export const envVars = loadEnvVariables();
