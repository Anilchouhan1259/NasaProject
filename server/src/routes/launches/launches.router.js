const express = require("express");

const {
  httpGetAllLaunches,
  httpAddNewLaunches,
  httpAbortLaunch,
} = require("./launches.controllers");

const launchesRouter = express.Router();
launchesRouter.get("/", httpGetAllLaunches);
launchesRouter.post("/", httpAddNewLaunches);
launchesRouter.delete("/:id", httpAbortLaunch);

module.exports = launchesRouter;
