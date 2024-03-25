const mongoose = require("mongoose");

const connectDB = async () => {
  let URI = process.env.MONGO_URI;
  try {
    if (!URI) throw new Error("DB URI not found");
    await mongoose.connect(URI);
    console.log("DB connected successfully");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
