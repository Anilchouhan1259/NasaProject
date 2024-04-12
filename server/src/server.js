const http = require("http");
require("dotenv").config();

const app = require("./app");
const { mongoConnect } = require("./utils/mongo");
const { loadPlanetData } = require("./models/planets.model");
const { loadLaunchData } = require("./models/launches.model");

const PORT = 8000 || process.env.PORT;

const server = http.createServer(app);
async function startServer() {
  await mongoConnect();
  await loadPlanetData();
  await loadLaunchData();
  server.listen(PORT, () => {
    console.log(`listning on port ${PORT}`);
  });
}
startServer();
