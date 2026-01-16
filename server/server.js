const express = require("express");
const cors = require("cors");
const createprRouter = require("./createpr"); 
const createpr2sapRouter = require("./createpr2sap");
const reportPRRouter = require("./reportpr");
const app = express();
app.use(cors());
app.use(express.json());


app.use("/api", createprRouter); 
app.use("/api", createpr2sapRouter);
app.use("/api", reportPRRouter);
app.listen(3001, () => console.log("Server running on port 3001"));
