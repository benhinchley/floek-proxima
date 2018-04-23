const express = require("express")();
const next = require("next");

const server = require("http").Server(express);
const io = require("socket.io")(server);

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

const app = next({ dev });
const handler = app.getRequestHandler();

io.on("connect", socket => {
  socket.on("floek:motion", ({ id, data }) => {
    console.log(id, data);
  });

  socket.on("floek:heartbeat", ({ sensor }) => {
    console.log("sensor", sensor);
    socket.broadcast.emit("floek:proxima:heartbeat", { sensor });
  });
});

app.prepare().then(() => {
  express.get("*", (req, res) => handler(req, res));

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on "http://localhost:${port}"`);
  });
});
