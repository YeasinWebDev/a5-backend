"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// external imports
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// error handlers
const globalErrorHandler_1 = require("./app/middlewares/globalErrorHandler");
const notFound_1 = require("./app/middlewares/notFound");
// routers
const auth_route_1 = require("./app/modules/auth/auth.route");
const agent_routes_1 = require("./app/modules/user/routes/agent.routes");
const admin_routes_1 = require("./app/modules/user/routes/admin.routes");
const user_routes_1 = require("./app/modules/user/routes/user.routes");
// create express app
const app = (0, express_1.default)();
// middleware
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173"],
    credentials: true,
}));
app.set("trust proxy", 1);
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// test route
app.get("/", (req, res) => {
    res.send("Hello World!");
});
// routers
app.use("/api/auth", auth_route_1.authRouters);
app.use("/api/user", user_routes_1.userRouters);
app.use("/api/agent", agent_routes_1.agentRouters);
app.use("/api/admin", admin_routes_1.adminRouters);
// global error handlers
app.use(globalErrorHandler_1.globalErrorHandler);
app.use(notFound_1.notFound);
exports.default = app;
