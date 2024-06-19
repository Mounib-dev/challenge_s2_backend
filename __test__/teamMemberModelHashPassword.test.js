import "../test-setup.js";

import mongoose from "mongoose";
import TeamMember from "../models/teamMemberModel.js";
import Task from "../models/taskModel.js";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

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

  test("should hash the password before saving the team member", async () => {
    const teamMemberData = {
      firstname: "Unit",
      lastname: "Test",
      jobTitle: "Tester",
      email: "unit@test.test",
      password: "plaintextpassword",
    };

    const teamMember = new TeamMember(teamMemberData);
    await teamMember.save();

    const savedTeamMember = await TeamMember.findOne({
      email: teamMemberData.email,
    });

    expect(savedTeamMember.password).not.toBe(teamMemberData.password);

    const isMatch = await bcrypt.compare(
      "plaintextpassword",
      savedTeamMember.password
    );
    expect(isMatch).toBe(true);
  });
});
