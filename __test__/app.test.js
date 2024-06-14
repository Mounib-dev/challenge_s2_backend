import "../test-setup.js";
import request from "supertest";
import app from "../app.js";

import mongoose from "mongoose";
import TeamMember from "../models/teamMemberModel.js";
import jwt from "jsonwebtoken";

describe("GET /api/v1/teamMembers", () => {
  let token;
  const customId = new mongoose.Types.ObjectId();
  let teamMember;

  beforeAll(async () => {
    await mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    teamMember = await TeamMember.create({
      _id: customId,
      email: "testuser@dev.io",
      password: "testpassword",
    });

    token = jwt.sign({ id: teamMember._id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await TeamMember.deleteOne({ _id: customId });
  });

  it("should respond with an array of employees", async () => {
    console.log(token);
    const response = await request(app)
      .get("/api/v1/teamMembers")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
  });

  it("should respond with an object containing one employee with the given ID in the url's param", async () => {
    console.log(token);
    const response = await request(app)
      .get(`/api/v1/teamMembers?id=${customId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(false);
  });
});

describe("GET /api/v1/teamMembers", () => {
  it("should respond with a 401 code status because no user is authenticated and no token is included in the request headers", async () => {
    const response = await request(app).get("/api/v1/teamMembers");
    expect(response.statusCode).toBe(401);
  });
});

describe("GET /api/v1/teamMembers?id=", () => {
  let token;
  let teamMember;

  beforeAll(async () => {
    await mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    teamMember = await TeamMember.create({
      email: "testuser@dev.io",
      password: "testpassword",
    });

    token = jwt.sign({ id: teamMember._id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await TeamMember.deleteOne({ _id: teamMember._id });
  });

  it("should respond with an array of employees", async () => {
    console.log(token);
    const response = await request(app)
      .get("/api/v1/teamMembers")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
  });
});

describe("POST /api/v1/teamMembers", () => {
  it("should add a new employee to the database", async () => {
    const newEmployee = {
      firstname: "Mounib",
      lastname: "OUROUA",
      jobTitle: "Développeur",
      email: "ouroua@dev.io",
      password: "Test@145",
      tasks: [],
    };
    const response = await request(app)
      .post("/api/v1/teamMembers")
      .send(newEmployee);

    expect(response.statusCode).toBe(201);
    expect(response.text).toBe("Team member successefuly added!");
  });

  it("should NOT add a new employee to the database because the email is unique", async () => {
    const newEmployee = {
      firstname: "Mounib",
      lastname: "OUROUA",
      jobTitle: "Développeur",
      email: "ouroua@dev.io",
      password: "Test@145",
      tasks: [],
    };
    const response = await request(app)
      .post("/api/v1/teamMembers")
      .send(newEmployee);

    expect(response.statusCode).toBe(409);
    expect(response.text).toBe("The member you try to enter already exists");
  });
});
