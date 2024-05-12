const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const connectDB = require("./db/connectDB");
const userRoutes = require("./routes/user.route");
const appointmentRoutes = require("./routes/appointment.route");

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

connectDB();

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/user", userRoutes);
app.use("/appointment", appointmentRoutes);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));
