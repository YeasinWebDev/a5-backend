// external modules
import { Server } from "http";
import mongoose from "mongoose";
// internal modules
import app from "./app";
import { envVars } from "./app/config/env";

let server: Server;

/**
 * Connects to MongoDB and starts the Express server.
 * Logs a message to the console indicating success or failure.
 * @returns {Promise<void>}
 */
const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);

    console.log("Connected to DB!!");

    server = app.listen(envVars.PORT, () => {
      console.log(`Server is listening to port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

// terminate the server
process.on("SIGTERM", () => {
  console.log("SIGTERM is received");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("unhandledRejection", (error) => {
  console.log("unhandledRejection", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  console.log("uncaughtException", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// start the server
(async () => {
  await startServer();
})();
