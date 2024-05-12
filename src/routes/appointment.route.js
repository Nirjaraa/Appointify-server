const express = require("express");
const router = express.Router();

const { createAppointment, viewAppointmentById, viewAppointment, acceptAppointment, rejectAppointment, cancelAppointment } = require("../controllers/appointment.controllers");

const { isUser } = require("../middleware/auth-Middleware");

router.post("/create", isUser, createAppointment);
router.get("/view/:id", isUser, viewAppointmentById);
router.get("/view", isUser, viewAppointment);
router.put("/accept/:id", isUser, acceptAppointment);
router.put("/cancel/:id", isUser, cancelAppointment);
router.put("/reject/:id", isUser, rejectAppointment);

module.exports = router;
