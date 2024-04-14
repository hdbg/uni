const express = require("express");
const api_router = express.Router();

const user = require("./user/routes");
const application = require("./application/routes");
const license = require("./licenses/routes");

api_router.use("/user", user);
api_router.use("/application", application);
api_router.use("/license", license);


module.exports = api_router;
