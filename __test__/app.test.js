import "../test-setup.js";
import request from "supertest";
import app from "../app.js";

import mongoose from "mongoose";
import TeamMember from "../models/teamMemberModel.js";
import Task from "../models/taskModel.js";
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
    const tasks = [
      {
        title: "Task 1",
        priority: "High",
        deadline: new Date("2024-07-01"),
        assignedTo: [teamMember._id],
      },
      {
        title: "Task 2",
        priority: "Medium",
        deadline: new Date("2024-07-02"),
        assignedTo: [teamMember._id],
      },
      {
        title: "Task 3",
        priority: "Low",
        deadline: new Date("2024-07-03"),
        assignedTo: [teamMember._id],
      },
      {
        title: "Task 4",
        priority: "High",
        deadline: new Date("2024-07-04"),
        assignedTo: [teamMember._id],
      },
      {
        title: "Task 5",
        priority: "Medium",
        deadline: new Date("2024-07-05"),
        assignedTo: [teamMember._id],
      },
    ];

    await Task.create(tasks);

    token = jwt.sign({ id: teamMember._id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await Task.deleteMany({});
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


//task

describe('Task API', () => {

  let token;
  const customId = new mongoose.Types.ObjectId();
  let teamMember;

  beforeAll(async () => {
    // Créer un member pour les tests
    teamMember = await TeamMember.create({
      firstname: 'adama',
      lastname: 'adama',
      jobTitle: 'dev',
      email: 'adama@dev.io',
      password: 'test123',
    });
  });

  afterAll(async () => {
    await Task.deleteMany({});
    await TeamMember.deleteOne({ _id: customId });
  });

  describe('POST /api/v1/tasks', () => {
    it('should create a new task and assign it to a team member', async () => {
      const newTask = {
        title: 'Test Task',
        description: 'Task for testing',
        assignedTo: teamMember._id,
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body.message).toContain('Successefuly created the task');
      const task = await Task.findOne({ title: 'Test Task' });
      expect(task).not.toBeNull();
      expect(task.assignedTo.toString()).toEqual(teamMember._id.toString());
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('should return a list of tasks', async () => {


      const response = await request(app)
        .get('/api/v1/tasks')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toEqual('Test Task');
    });



    // a regler 
    //   it('should return the count of tasks when getCount is true', async () => {
    //     await Task.create({
    //       title: 'Test Task',
    //       description: 'Task for testing ',
    //       assignedTo: teamMember._id,
    //     });
    //     await Task.create({
    //       title: 'Test Task 1',
    //       description: 'Task for testing 1',
    //       assignedTo: teamMember._id,
    //     });
    //     await Task.create({
    //       title: 'Test Task 2',
    //       description: 'Task for testing 2',
    //       assignedTo: teamMember._id,
    //     });

    //     const response = await request(app)
    //       .get('/api/v1/tasks?getCount=true')
    //       .expect(200);

    //     expect(response.body).toEqual(3);
    //   });
    // });

    describe('GET /api/v1/tasks/:id', () => {
      it('should return a task by ID', async () => {
        const task = await Task.create({
          title: 'Test1 Task',
          description: 'Task for testing',
          assignedTo: teamMember._id,
        });

        const response = await request(app)
          .get(`/api/v1/tasks/${task._id}`)
          .expect(200);

        expect(response.body.title).toEqual('Test1 Task');
      });
    });



    // a regler
    // describe('PUT /api/v1/tasks/:id', () => {
    //   it('should update a task', async () => {
    //     const task = await Task.create({
    //       title: 'Test1 Task',
    //       description: 'Task for testing',
    //       assignedTo: teamMember._id,
    //     });

    //     const updatedTask = {
    //       title: 'Updated Task',
    //       description: 'Updated description',
    //       assignedTo: teamMember._id,
    //     };

    //     const response = await request(app)
    //       .put(`/api/v1/tasks/${task._id}`)
    //       .send(updatedTask)
    //       .expect(201);

    //     expect(response.body.message).toContain('Task updated successfuly');
    //     const taskAfterUpdate = await Task.findById(task._id);
    //     expect(taskAfterUpdate.title).toEqual('Updated Task');
    //     expect(taskAfterUpdate.description).toEqual('Updated description');

    //   });
    // });

    describe('DELETE /api/v1/tasks/:id', () => {
      it('should delete a task', async () => {
        const task = await Task.create({
          title: 'Test Task 1',
          description: 'Task for testing',
          assignedTo: teamMember._id,
        });

        await request(app)
          .delete(`/api/v1/tasks/${task._id}`)
          .expect(204);

        const deletedTask = await Task.findById(task._id);
        expect(deletedTask).toBeNull();
      });
    });
  });