const mongoose = require("mongoose");

const dbName = process.env.DB_NAME || "workloads";
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
      console.log(dbName);
      console.log("Connected to MongoDB workloads Database");
      if (dbName === "workloads_test") {
        const teamMembersCollection = await mongoose.connection.db.collection(
          "teammembers"
        );
        await teamMembersCollection.deleteMany({});
        const tasksCollection = await mongoose.connection.db.collection(
          "tasks"
        );
        await tasksCollection.deleteMany({});
        const teamsCollection = await mongoose.connection.db.collection(
          "teams"
        );
        await teamsCollection.deleteMany({});
        console.log("All data deleted from the tests database");
      }
    } catch (err) {
      console.error("Error connecting to the Database");
    }
  }
}

module.exports = new Database();
