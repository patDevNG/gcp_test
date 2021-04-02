const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const server = express();
server.use(bodyParser.urlencoded({ extended: true }));
server.use(cors());
server.use(bodyParser.json());

server.post("/test", async (req, res) => {
  const result = req.body;
  res.status(200).json({
    message: "Successful Sent",
    data: result,
  });
});

server.post("/scheduler", async (req, res) => {
  console.log("Scheduler called");

  res.status(200).json({
    message: "Successful",
  });
});

server.listen(process.env.PORT || 8584, () => {
  console.log(`Server started at port :8584`);
});
