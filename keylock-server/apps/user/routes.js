const express = require("express");
const moment = require("moment");
const logger = require("../../libraries/logger");

const { user_dao, Permissions } = require("../../libraries/dao");

const router = express.Router();
const schemas = require("./schemas");

const { signature_secret } = require("./secret");
var jwt = require("jsonwebtoken");

async function authorize(req, resp) {
  const valid = schemas.validate_auth(req.body);

  if (!valid) {
    return resp.status(400).json({ errors: schemas.validate_auth.errors });
  }

  const user = await user_dao.find_by_username(req.body.username);

  if (user == null) {
    return resp
      .status(400)
      .json({ errors: { msg: "User not found", code: "USER_NOT_FOUND" } });
  }

  const current_password = user_dao.hash_password(req.body.password);

  if (current_password != user.password) {
    logger.warn({
      event: "user.try_auth",
      reject_reason: "invalid_password",
      username: user.username,
    });
    return resp
      .status(400)
      .json({
        errors: { msg: "Invalid password", code: "USER_INVALID_PASSWORD" },
      });
  }

  logger.info({ event: "user.auth", username: user.username });

  // actually it's my first time using jwt and token auth in general :D

  const expiration = moment().add(1, "hour").toDate();

  const new_auth_token = jwt.sign(
    {
      username: user.username,
      role: user.role,
      exp: Math.floor(expiration / 1000),
    },
    signature_secret // should move to const
  );

  await user_dao.add_token(user.username, new_auth_token, expiration);

  // should emit token here
  return resp.status(200).json({
    status: "ok",
    data: {
      token: new_auth_token,
    },
  });
}

router.post("/auth", authorize);

router.post("/register", async (req, resp) => {
  const valid = schemas.validate_register(req.body);
  if (!valid) {
    return resp.status(400).json({ errors: schemas.validate_register.errors });
  }

  const is_user_already_exist = await user_dao.exists(req.body.username);
  if (is_user_already_exist) {
    return resp
      .status(400)
      .json({
        errors: { msg: "User already registered", code: "NAME_OCCUPIED" },
      });
  }

  // better safe than sorry!
  if (req.body.role == Permissions.Root) {
    return resp
      .status(403)
      .json({
        errors: { msg: "Can't register as root", code: "ACCESS_DENIED" },
      });
  }

  console.log(user_dao.hash_password(req.body.password));
  const new_user = await user_dao.register(
    req.body.username,
    user_dao.hash_password(req.body.password),
    req.body.role
  );

  logger.info({ event: "user.registered", username: new_user.username });

  return authorize(req, resp);
});

router.get("/exists/:username", async (req, resp) => {
  const exists = await user_dao.exists(req.params.username);

  return resp.status(200).json({ data: {exists: exists} });
});

module.exports = router;
