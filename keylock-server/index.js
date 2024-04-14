const express = require("express");
const app = express();
const logger = require("./libraries/logger");
const models = require("./libraries/models");

const v1 = require("./apps/api");

app.use(express.json());

app.use("/api", v1);

app.listen(3000, async () => {
  logger.info({event: "server.boot"});
  await models.connect();
})
