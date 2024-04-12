const express = require("express");

const { httpGetAllPlanet } = require("./planets.controllers");

const planetsRouter = express.Router();
planetsRouter.get("/", httpGetAllPlanet);

module.exports = planetsRouter;
