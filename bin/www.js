#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from "../app.js";
import debug from "debug";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";

// const { createServer } = http;
const { createServer } = https;
const { readFileSync } = fs;

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Adding HTTPS Certificates
 */

// Uncomment and adjust paths if using HTTPS
const options = {
  key: readFileSync("C:/certificates/key.pem"),
  cert: readFileSync("C:/certificates/cert.pem"),
};

/**
 * Create HTTP server.
 */

// const server = createServer(app);
// Uncomment to create HTTPS server
const server = https.createServer(options, app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
}
