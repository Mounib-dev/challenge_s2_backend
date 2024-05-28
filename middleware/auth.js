require("dotenv").config();
const jwt = require("jsonwebtoken");
const TeamMember = require("../models/teamMemberModel");
const secret = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
  console.log(req.header("Authorization"));
  console.log("test?");

  const token = req.header("Authorization").replace("Bearer ", "");
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

module.exports = auth;
