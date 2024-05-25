const mongoose = require("mongoose");
const { errorHandler } = require("../utils/error-handler");
const bcrypt = require("bcryptjs");
const Appointment = require("../Models/Appointment.model");
const { isValidObjectId } = require("../utils/isValidObjectId");
const User = require("../Models/User.model");
const { sendEmail, createAppointmentText } = require("../utils/sendEmail");
const crypto = require("crypto");

const createAppointment = async (req, res) => {
  try {
    const { startTime, endTime, description, appointedTo, images, category } = req.body;

    if (!startTime || !description || !appointedTo || !endTime) {
      return res.status(400).json({ error: "Please fill all the required fields" });
    }
    if (appointedTo == req.user.id) {
      return res.status(400).json({ error: "You cannot book appointment to yourself" });
    }

    const currentDate = new Date();
    if (currentDate > startTime) {
      return res.status(400).json({ error: "Time is invalid" });
    }

    const overlappingAppointments = await Appointment.find({
      $or: [
        // Non-Overlaping
        { $and: [{ startTime: { $lte: startTime } }, { endTime: { $gt: startTime } }] },
        { $and: [{ startTime: { $lt: endTime } }, { endTime: { $gte: endTime } }] },
        // Overlapping
        { $and: [{ startTime: { $gt: startTime } }, { endTime: { $lt: endTime } }] },
        { $and: [{ startTime: { $lte: startTime } }, { endTime: { $gte: endTime } }] },
      ],
    });

    if (overlappingAppointments[0]) {
      return res.status(400).json({ error: "You cannot book appointments in this time interval" });
    }

    const newAppointment = await Appointment.create({
      startTime,
      endTime,
      description,
      appointedBy: req.user.id,
      appointedTo,
      images,
      category,
    });

    if (newAppointment) {
      return res.status(201).json({ message: "Appointment Successful", status: newAppointment.status });
    }
  } catch (error) {
    return res.status(500).json({ error: errorHandler(error) });
  }
};

const viewAppointmentById = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;

    const seeAppointment = await Appointment.find({
      _id: appointmentId,
      $or: [{ appointedBy: userId }, { appointedTo: userId }],
    });

    if (!seeAppointment[0]) {
      return res.status(200).json({ message: "You don't have any pending appointments" });
    }

    return res.status(200).json({ message: "Appointment Retrived Successfully !!", appointment: seeAppointment[0] });
  } catch (error) {
    return res.status(500).json({ error: errorHandler(error) });
  }
};

const viewAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const allAppointments = await Appointment.find({
      $or: [{ appointedBy: userId }, { appointedTo: userId }],
    });
    if (!allAppointments[0]) {
      return res.status(404).json({ message: "You don't have any appointments" });
    }
    return res.status(200).json({ allAppointments });
  } catch (error) {
    return res.status(500).json({ error: errorHandler(error) });
  }
};

const acceptAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;

    const acceptAppointments = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        appointedTo: userId,
        status: "pending",
      },
      { $set: { status: "accepted" } },
      { new: true }
    );

    if (!acceptAppointments) {
      return res.status(404).json({ message: "No pending appointments" });
    }
    const { startTime, status } = acceptAppointments;
    const newStartTime = new Date(startTime).toLocaleString();
    const appointedToUser = await User.findById(acceptAppointments.appointedTo);
    const appointedByUser = await User.findById(acceptAppointments.appointedBy);

    const recipient = req.user.email;
    const emailText = await createAppointmentText(appointedByUser.fullName, status, appointedToUser.fullName, newStartTime);
    const mailOptions = {
      subject: "Appointment Approved",
      text: emailText,
    };

    sendEmail(recipient, mailOptions);
    return res.status(200).json({ message: "Appointment has been approved successfully", acceptAppointments });
  } catch (error) {
    return res.status(500).json({ error: errorHandler(error) });
  }
};

const rejectAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;

    const rejectAppointments = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        appointedTo: userId,
        status: "pending",
      },
      { $set: { status: "rejected" } },
      { new: true }
    );

    if (!rejectAppointments) {
      return res.status(404).json({ message: "No appointments rejected" });
    }
    const { startTime, status } = rejectAppointments;
    const newStartTime = new Date(startTime).toLocaleString();
    const appointedToUser = await User.findById(rejectAppointments.appointedTo);
    const appointedByUser = await User.findById(rejectAppointments.appointedBy);

    const recipient = req.user.email;
    const emailText = await createAppointmentText(appointedByUser.fullName, status, appointedToUser.fullName, newStartTime);
    const mailOptions = {
      subject: "Appointment Rejected",
      text: emailText,
    };

    sendEmail(recipient, mailOptions);
    return res.status(200).json({ message: "Appointment has been rejected", rejectAppointments });
  } catch (error) {
    return res.status(500).json({ error: errorHandler(error) });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;

    const cancelAppointments = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        appointedBy: userId,
        status: "pending",
      },
      { $set: { status: "cancelled" } },
      { new: true }
    );

    if (!cancelAppointments) {
      return res.status(404).json({ message: "No appointments cancelled" });
    }

    const { startTime, status } = cancelAppointments;
    const newStartTime = new Date(startTime).toLocaleString();
    const appointedToUser = await User.findById(cancelAppointments.appointedTo);
    const appointedByUser = await User.findById(cancelAppointments.appointedBy);

    const recipient = req.user.email;
    const emailText = await createAppointmentText(appointedByUser.fullName, status, appointedToUser.fullName, newStartTime);
    const mailOptions = {
      subject: "Appointment Cancelled",
      text: emailText,
    };

    sendEmail(recipient, mailOptions);
    return res.status(200).json({ message: "Appointment has been cancelled", cancelAppointments });
    // return res.status(200).json({ message: "Appointment has been cancelled", cancelAppointments });
  } catch (error) {
    return res.status(500).json({ error: errorHandler(error) });
  }
};

module.exports = { createAppointment, viewAppointmentById, viewAppointment, acceptAppointment, rejectAppointment, cancelAppointment };
