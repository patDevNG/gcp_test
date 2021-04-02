const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const PubSub = require("@google-cloud/pubsub");

const server = express();
server.use(bodyParser.urlencoded({ extended: true }));
server.use(cors());
server.use(bodyParser.json());

//Publish Message
const pubSubClient = new PubSub();
async function publishMessage(payload) {
  const { data, topic } = payload;
  const dataValue = typeof data === "string" ? data : JSON.stringify(data);
  const dataBuffer = Buffer.from(dataValue);
  /**
   * These is a non-zero chance that messages will be sent more than once
   * to a subscriber.
   *
   * TODO: leverage the messageId to assure idempotent operations
   */
  const messageId = await pubSubClient.topic(topic).publish(dataBuffer);
  console.log(`Message ${messageId} published.`);
  return messageId;
}

// Test Endpoint
server.post("/test", async (req, res) => {
  const result = req.body;

  publishMessage({
    data: {
      firstName: "Jude",
      lastName: "Okafor",
      adress: "Kubwa",
    },
    topic: "send-my-messsage",
  });

  return res.status(200).json({
    message: "Successful Sent",
    data: result,
  });
});

//Secheduler Endpoint.
server.post("/scheduler", async (req, res) => {
  console.log("Scheduler called");

  return res.status(200).json({
    message: "Successful",
  });
});

const readPublished = (req, res, next) => {
  if (!req.body) {
    const msg = "no Pub/Sub message received";
    console.error(`error: ${msg}`);
    return res.status(400).send(`Bad Request: ${msg}`);
  }

  if (!req.body.message) {
    const msg = "invalid Pub/Sub message format";
    console.error(`error: ${msg}`);
    return res.status(400).send(`Bad Request: ${msg}`);
  }

  if (req.body.message.data) {
    const pubSubMessageData = Buffer.from(
      req.body.message?.data,
      "base64"
    ).toString();
    const messageId = req.body.message?.messageId;
    req.body = JSON.parse(pubSubMessageData);
    req.body.messageId = messageId;
  }
  return next();
};

// Message Endpoint
server.post("/message", readPublished, async (req, res) => {
  console.log("message endpoint is being called", req.body);
  const { firstName, lastName } = req.body;

  console.log({ firstName, lastName });
  return res.status(200).json({
    message: "Successful",
    data: req.body,
  });
});

//Start Server Here!!!
server.listen(process.env.PORT || 8584, () => {
  console.log(`Server started at port :8584`);
});
