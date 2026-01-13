// server/server.js
const express = require("express");
const cors = require("cors");
const createprRouter = require("./createpr");  // import router

const app = express();
app.use(cors());
app.use(express.json());

// ใช้ router prefix /api
app.use("/api", createprRouter);  // จะได้ /api/t_Material

app.listen(3001, () => console.log("Server running on port 3001"));
