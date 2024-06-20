import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import TeamMember from "../models/teamMemberModel.js";
const secret = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
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
