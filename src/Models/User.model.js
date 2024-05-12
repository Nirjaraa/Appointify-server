const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["client", "professional"],
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    DOB: {
      type: Date,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    profession: {
      type: String,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      enum: ["medical", "salon", "plumber"],
    },
    images: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);
module.exports = mongoose.model("User", userSchema);
