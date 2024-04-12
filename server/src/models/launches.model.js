const axios = require("axios");

const launchesDatabase = require("./launches.mongoose");
const planets = require("./planets.mongoose");
const DEFAULT_FLIGHT_NUMBER = 100;
async function getAllLaunches(skip, limit) {
  return await launchesDatabase
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}
async function saveLaunch(launch) {
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}
async function findLatestFlightNumber() {
  const lattestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
  if (!lattestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return lattestLaunch.flightNumber;
}
async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No matching planets found");
  }
  const newFlightNumber = (await findLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["anil", "musk"],
    flightNumber: newFlightNumber,
  });
  await saveLaunch(newLaunch);
}
async function populateDataBase() {
  const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if (response.status != 200) {
    console.log("launch data dowload failed");
    throw new Error("launch data download failed");
  }
  const launchDocs = response.data.docs;
  for (launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers: customers,
    };
    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("database Populated");
  } else {
    populateDataBase();
  }
}
async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}
async function isExistLaunch(id) {
  findLaunch(id);
}
async function abortLaunchById(id) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: id,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.modifiedCount === 1;
}

module.exports = {
  getAllLaunches,
  loadLaunchData,
  scheduleNewLaunch,
  isExistLaunch,
  abortLaunchById,
};
