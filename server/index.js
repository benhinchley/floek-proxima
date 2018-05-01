const express = require("express")();
const next = require("next");

const server = require("http").Server(express);
const io = require("socket.io")(server);

const { enforceHTTPS } = require("./utils");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

const app = next({ dev });
const handler = app.getRequestHandler();

let currentSection = -1;

io.on("connect", socket => {
  socket.on("floek:proxima:section", ({ current }) => {
    currentSection = current;
    socket.broadcast.emit("floek:proxima:section", { current: currentSection });
  });

  socket.on("floek:chaos:section", data => {
    socket.broadcast.emit("floek:chaos:section", data);
  });

  socket.on("floek:chaos:klangfarben:sequence", data => {
    socket.broadcast.emit("floek:chaos:klangfarben:sequence", data);
  });

  // motion data
  socket.on("floek:movement:height", data => {
    socket.broadcast.emit("floek:movement:height", data);
  });
  socket.on("floek:movement:speed", data => {
    socket.broadcast.emit("floek:movement:speed", data);
  });

  // this is an external feed
  socket.on("floek:heartbeat", ({ sensor }) => {
    socket.broadcast.emit("floek:proxima:heartbeat", { sensor });
  });

  // audience trigger for heartrate sound
  socket.on("floek:proxima:heartbeat:audience", data => {
    socket.broadcast.emit("floek:proxima:heartbeat:audience", data);
  });
});

app.prepare().then(() => {
  if (process.env.NODE_ENV === "production") {
    express.use("*", enforceHTTPS);
  }
  express.get("*", (req, res) => handler(req, res));

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on "http://localhost:${port}"`);
  });
});
