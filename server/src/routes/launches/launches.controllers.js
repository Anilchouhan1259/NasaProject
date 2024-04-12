const {
  getAllLaunches,
  scheduleNewLaunch,
  isExistLaunch,
  abortLaunchById,
} = require("../../models/launches.model");

const getPagination = require("../../utils/pagination");
async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  return res.status(200).json(await getAllLaunches(skip, limit));
}
async function httpAddNewLaunches(req, res) {
  const launch = req.body;
  if (
    !launch.mission ||
    !launch.target ||
    !launch.rocket ||
    !launch.launchDate
  ) {
    return res.status(400).json({
      error: "something is missing",
    });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "invalid date",
    });
  }
  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}
async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);
  const isExist = await isExistLaunch(launchId);
  if (!isExist) {
    return res.status(404).json({
      error: "launch does not exist",
    });
  }
  const aborted = await abortLaunchById(launchId);
  if (!aborted) {
    return res.status(400).json({
      error: "aborted doesn't work",
    });
  }
  return res.status(200).json({
    ok: "succesfully aborted",
  });
}
module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunches,
  httpAbortLaunch,
};
