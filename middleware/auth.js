import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import TeamMember from "../models/teamMemberModel.js";
const secret = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
  console.log(req.header("Authorization"));
  console.log("test?");

  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    console.log("test");
    return res.status(401).send({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    const user = await TeamMember.findOne(
      {
        _id: decoded.id,
      },
      { password: 0 }
    );
    console.log("user : ", user);
    if (!user) {
      throw new Error();
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Invalid token" });
  }
};

export default auth;
