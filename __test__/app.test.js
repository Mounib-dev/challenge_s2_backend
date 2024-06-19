import "../test-setup.js";
import request from "supertest";
import app from "../app.js";

import mongoose from "mongoose";
import TeamMember from "../models/teamMemberModel.js";
import Task from "../models/taskModel.js";
import Team from "../models/teamModel.js";
import jwt from "jsonwebtoken";

/* 

/// TESTING TEAM MEMBERS API

*/
describe("Team Members API", () => {
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
    await Task.deleteMany({});
    await TeamMember.deleteOne({ _id: customId });
  });

  it("should respond with an array of employees", async () => {
    const response = await request(app)
      .get("/api/v1/teamMembers")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
  });

  it("should respond with an object containing one employee with the given ID in the url's param", async () => {
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

  it("should respond with an array of employees that have a null team ID", async () => {
    const response = await request(app)
      .get("/api/v1/teamMembers?available=true")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach((employee) => {
      expect(employee.teamId).toBeNull();
    });
  });

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
      .set("Authorization", `Bearer ${token}`)
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
      .set("Authorization", `Bearer ${token}`)
      .send(newEmployee);

    expect(response.statusCode).toBe(409);
    expect(response.text).toBe("The member you try to enter already exists");
  });
});
/* 

/// TESTING Tasks API

*/

describe("Tasks API", () => {
  let token;
  const customId = new mongoose.Types.ObjectId();
  let teamMember;

  beforeAll(async () => {
    teamMember = await TeamMember.create({
      firstname: "adama",
      lastname: "adama",
      jobTitle: "dev",
      email: "adama@dev.io",
      password: "test123",
    });
    token = jwt.sign({ id: teamMember._id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await Task.deleteMany({});
    await TeamMember.deleteOne({ _id: customId });
  });

  it("should create a new task and assign it to a team member", async () => {
    const newTask = {
      title: "Test Task 1",
      description: "Task for testing",
      assignedTo: teamMember._id,
    };

    const response = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send(newTask)
      .expect(201);

    expect(response.body.message).toContain("Successefuly created the task");
    const task = await Task.findOne({ title: "Test Task 1" });
    expect(task).not.toBeNull();
    expect(task.assignedTo.toString()).toEqual(teamMember._id.toString());
  });

  it("should return a list of tasks", async () => {
    const response = await request(app)
      .get("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toEqual("Test Task 1");
  });

  it("should return the count of tasks when getCount is true", async () => {
    await Task.create({
      title: "Test Task 2",
      description: "Task for testing ",
      assignedTo: teamMember._id,
    });
    await Task.create({
      title: "Test Task 3",
      description: "Task for testing 1",
      assignedTo: teamMember._id,
    });
    await Task.create({
      title: "Test Task 4",
      description: "Task for testing 2",
      assignedTo: teamMember._id,
    });

    const response = await request(app)
      .get("/api/v1/tasks?getCount=true")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(4);
  });

  it("should return a task by ID", async () => {
    const task = await Task.create({
      title: "Test1 Task",
      description: "Task for testing",
      assignedTo: teamMember._id,
    });

    const response = await request(app)
      .get(`/api/v1/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.title).toEqual("Test1 Task");
  });

  it("should update a task", async () => {
    const task = await Task.findOne({ title: "Test1 Task" });

    const updatedTask = {
      title: "Updated Task",
      description: "Updated description",
      assignedTo: teamMember._id,
    };

    const response = await request(app)
      .put(`/api/v1/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedTask)
      .expect(201);

    expect(response.body.message).toContain("Task updated successfuly");
    const taskAfterUpdate = await Task.findById(task._id);
    expect(taskAfterUpdate.title).toEqual("Updated Task");
    expect(taskAfterUpdate.description).toEqual("Updated description");
  });

  it("should delete a task", async () => {
    const task = await Task.findOne({ title: "Updated Task" });

    await request(app)
      .delete(`/api/v1/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const deletedTask = await Task.findById(task._id);
    expect(deletedTask).toBeNull();
  });
});
// /*

// /// TESTING TEAMS API

// */
describe("Teams API", () => {
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
    const teams = [
      {
        name: "Team 1",
        creationDate: new Date("2024-07-01"),
        description: "Team 1 description",
      },
      {
        name: "Team 2",
        creationDate: new Date("2024-07-02"),
        description: "Team 2 description",
      },
    ];

    await Team.create(teams);

    token = jwt.sign({ id: teamMember._id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await Team.deleteMany({});
    await TeamMember.deleteOne({ _id: customId });
  });

  it("should create a new team", async () => {
    const newTeam = {
      name: "Team 3",
      creationDate: new Date("2024-07-03"),
      description: "Team 3 description",
    };

    const response = await request(app)
      .post("/api/v1/teams/create")
      .set("Authorization", `Bearer ${token}`)
      .send(newTeam)
      .expect(201);
    console.log(response);
    expect(response.body.message).toContain("Team created successfully");
    const team = await Team.findOne({ name: "Team 3" });
    expect(team).not.toBeNull();
    expect(team._id.toString()).toEqual(response.body.team._id.toString());
  });

  it("should return a list of teams", async () => {
    const response = await request(app)
      .get("/api/v1/teams")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveLength(3);
    expect(response.body[0].name).toEqual("Team 1");
  });

  it("should return the count of teams when getCount is true", async () => {
    const response = await request(app)
      .get("/api/v1/teams?getCount=true")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(3);
  });
});
