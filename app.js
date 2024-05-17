//Env variables
require("dotenv").config();
//Database
const database = require("./database");

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth.api");
const taskRouter = require("./routes/tasks.api");
const teamMembersRouter = require("./routes/teamMembers.api");
const teamRouter = require("./routes/team.api");

var app = express();

const router = require("./routes");

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


module.exports = app;
