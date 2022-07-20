const mongoose = require("mongoose");
const mongoURI =
  process.env.mongoURI ||
  "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";
const connectToMongo = async () => {
  try {
    mongoose.connect(mongoURI, () => {
      console.log("connected");
      console.log(mongoose.connection);
    });
  } catch (e) {
    console.log(e);
  }
};
module.exports = { connectToMongo, mongoURI };
