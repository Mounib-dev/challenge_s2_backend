import express from "express";
import request from "supertest";
import { validateLogin } from "../middleware/validators.js";

const app = express();
app.use(express.json());

app.post("/login", validateLogin, (req, res) => {
  res.status(200).send("Login successful");
});

describe("validateLogin middleware", () => {
  test("should fail if email is invalid", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "invalid-email", password: "Password123!" });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: "Email must be a valid email address" }),
      ])
    );
  });

  test("should fail if password contains SQL injection pattern", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "test@example.com", password: "DROP TABLE users;" });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Password contains forbidden characters or patterns",
        }),
      ])
    );
  });

  test("should succeed with valid email and password", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "test@example.com", password: "Password123!" });

    expect(response.status).toBe(200);
    expect(response.text).toBe("Login successful");
  });
});
