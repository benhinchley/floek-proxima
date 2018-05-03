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

  bundle.elements.forEach(({ address, args }) => {
    console.log({ time: new Date(), address, args });
    const sensor = address.split("/")[3];
    wss.emit("floek:heartbeat", { sensor });
  });
});

socket.on("listening", () => {
  const address = socket.address();
  console.log(`> listening on ${address.address}:${address.port}`);
});

socket.bind(9000);
