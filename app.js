import dotenv from "dotenv";
dotenv.config();

import database from "./database.js";

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";

import indexRouter from "./routes/index.js";
import authRouter from "./routes/auth.api.js";
import taskRouter from "./routes/tasks.api.js";
import teamMembersRouter from "./routes/teamMembers.api.js";
import teamRouter from "./routes/team.api.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

import router from "./routes/index.js";
app.use(router);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/api/v1", indexRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/teamMembers", teamMembersRouter);
app.use("/api/v1/teams", teamRouter);

export default app;
