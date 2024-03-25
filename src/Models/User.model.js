const mongoose = require("mongoose");
const userRoleEnum = require("../enum/userRoleEnum");

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: userRoleEnum,
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
    images: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);
module.exports = mongoose.model("User", userSchema);
