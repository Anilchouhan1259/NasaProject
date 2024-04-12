const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../utils/mongo");
describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
  });
  afterAll(async () => {
    await mongoDisconnect();
  });
  describe("Test GET /launches", () => {
    test("it should response with 200 succes", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "planet Namek",
      rocket: "NCC 187-f",
      target: "Kepler-296 A f",
      launchDate: "january 8, 2001",
    };
    const LaunchDataWithoutDate = {
      mission: "planet Namek",
      rocket: "NCC 187-f",
      target: "Kepler-296 A f",
    };
    const launchDataWithInvalidDate = {
      mission: "planet Namek",
      rocket: "NCC 187-f",
      target: "Kepler-296 A f",
      launchDate: "booo",
    };
    test("it should response with 201 success", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);
      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(requestDate).toBe(responseDate);
      expect(response.body).toMatchObject(LaunchDataWithoutDate);
    });
    test("it should catch missing data", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(LaunchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "something is missing",
      });
    });
    test("it should catch missing date", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "invalid date",
      });
    });
  });
});
