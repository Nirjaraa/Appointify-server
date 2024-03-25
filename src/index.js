const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const connectDB = require("./db/connectDB");

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

connectDB();

app.use(express.json());
app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));
