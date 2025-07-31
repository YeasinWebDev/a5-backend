// external imports
import cors from "cors";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
// error handlers
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
// routers
import { authRouters } from "./app/modules/auth/auth.route";
import { agentRouters } from "./app/modules/user/routes/agent.routes";
import { adminRouters } from "./app/modules/user/routes/admin.routes";
import { userRouters } from "./app/modules/user/routes/user.routes";

// create express app
const app = express();

// middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// test route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// routers
app.use("/api/auth", authRouters);
app.use("/api/user", userRouters);
app.use("/api/agent", agentRouters);
app.use("/api/admin", adminRouters);

// global error handlers
app.use(globalErrorHandler);
app.use(notFound);

export default app;
