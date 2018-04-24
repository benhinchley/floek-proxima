const dgram = require("dgram");
const path = require("path");

const oscmsg = require("osc-msg");
const io = require("socket.io-client");

const socket = dgram.createSocket("udp4");
const wss = io("https://floek-proxima.glitch.me");

socket.on("message", buffer => {
  const bundle = oscmsg.decode(buffer, {
    strict: true,
    strip: true,
    bundle: true
  });

  if (bundle.error) {
    console.error(bundle.error);
    return;
  }

  bundle.elements.forEach(message => {
    const sensor = message.address.split("/")[3];
    wss.emit("floek:heartbeat", { sensor });
  });
});

console.debug("binding to port 9000");
socket.bind(9000);
