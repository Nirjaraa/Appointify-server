const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

app.use(express.json());
app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));
