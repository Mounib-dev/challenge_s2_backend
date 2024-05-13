const mongoose = require("mongoose");

const dbName = "workloads";
const uri = `mongodb://127.0.0.1:27017/${dbName}`;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

class Database {
  constructor() {
    this._connect();
  }

  async _connect() {
    try {
      await mongoose.connect(uri, options);
      console.log("Connected to MongoDB workloads Database");
    } catch (err) {
      console.error("Error connecting to the Database");
    }
  }
}

module.exports = new Database();
