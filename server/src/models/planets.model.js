const { parse } = require("csv-parse");
const path = require("path");
const planets = require("./planets.mongoose");

const fs = require("fs");
const habitablePlanets = [];
function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}
function loadPlanetData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("end", async () => {
        const planetLength = (await getAllPlanets()).length;
        console.log(`${planetLength} habitable planet found`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find({});
}
async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      { keplerName: planet.kepler_name },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`planets data didn't saved ${err}`);
  }
}
module.exports = {
  planets: habitablePlanets,
  loadPlanetData,
  getAllPlanets,
};
