const express = require("express");
const app = express();
const logger = require("./libraries/logger");
const models = require("./libraries/models");

const port = 3000;

const v1 = require("./apps/api");

app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  logger.debug({event: "request", method: req.method, path: req.path});
  next();
});

app.use("/api", v1);

app.listen(port, async () => {
  logger.info({event: "server.boot", port: port});
  await models.connect();
})
