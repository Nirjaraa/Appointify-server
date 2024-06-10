const mongoose = require("mongoose");

const appointmentSchema = mongoose.Schema(
  {
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    appointedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    appointedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["accepted", "rejected", "cancelled", "pending"],
      default: "pending",
    },

    images: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Appointment", appointmentSchema);
