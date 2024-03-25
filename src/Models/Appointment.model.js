const mongoose = require("mongoose");
const appointmentStatusEnum = require("../enum/appointmentStatusEnum");

const AppointmentSchema = mongoose.Schema(
  {
    time: {
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
    },
    appointedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: appointmentStatusEnum,
    },
    images: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("goal", goalschema);
