const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({dev})
const handler = nextApp.getRequestHandler()

const { calculateDistance } = require("./lib/utils")

const previousLocations = {}

io.on("connect", socket => {
  socket.on("location", ({id: dID, location}) => {
    let ids = Object.keys(previousLocations)
    if (ids.length < 1) {
      previousLocations[dID] = location
      return;
    }
    
    const distance = ids
      .filter(id => id !== dID)
      .map(id => ({id, distance: calculateDistance(previousLocations[id], location)}))
      .sort(({distance: a}, {distance: b}) => a-b)
      .slice(0,1)
    
    console.debug(dID, distance)
    
    if (distance.length > 0) {
      socket.emit("distance", distance[0].distance)
    }
    
    previousLocations[dID] = location
    
  })
  
  socket.on("floek:motion", ({id, data}) => {
    console.log(id, data)
  })
  
})

nextApp.prepare().then(() => {
  app.get("*", (req, res) => handler(req, res))
  
  server.listen(process.env.PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on port ${process.env.PORT}`)
  })
})