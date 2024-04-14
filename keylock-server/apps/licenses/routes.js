const express = require("express");
const logger = require("../../libraries/logger");
const { createPrivateKey, createSign } = require("crypto");
const { promisify } = require("util");
const moment = require("moment");

const { enforce_user_auth } = require("../user/middlewares");

const {
  app_dao,
  license_dao,
  user_dao,
  LicenseStatus,
} = require("../../libraries/dao");

const router = express.Router();
const schemas = require("./schemas");

router.use(enforce_user_auth);

// more or less moderation
router.post("/grant", async (req, resp) => {
  if (req.user.role != "DEV" && req.user.role != "ROOT") {
    logger.warn({
      event: "license.grant",
      reject_reason: "permission_denied",
      username: req.user.username,
    });
    return resp.status(403).json({ errors: { msg: "Permission denied" } });
  }

  const valid = schemas.validate_grant_license(req.body);

  if (!valid) {
    return resp
      .status(400)
      .json({ errors: schemas.validate_grant_license.errors });
  }

  const app = await app_dao.find_by_name(req.body.application);

  if (app == null) {
    return resp.status(400).json({ errors: { msg: "App not found" } });
  }

  if (app.owner != req.user.id) {
    logger.error({
      event: "license.grant",
      reject_reason: "not_owner",
      username: req.user.username,

      owner: app.owner,
      requester: req.user,
    });
    return resp.status(403).json({ errors: { msg: "Permission denied" } });
  }

  const user = await user_dao.find_by_username(req.body.holder);

  if (user == null) {
    return resp.status(400).json({ errors: { msg: "User not found" } });
  }

  const valid_until = moment(req.body.valid_until);

  if (!valid_until.isValid() || valid_until.isBefore(moment())) {
    return resp.status(400).json({ errors: { msg: "Invalid expiration" } });
  }

  await license_dao.grant_license(
    req.body.holder,
    app.name,
    req.body.hwid,
    valid_until.toDate()
  );

  logger.info({
    event: "license.grant",
    app: app.name,
    user: req.body.holder,
  });

  return resp.status(200).json({ status: "ok" });
});

router.post("/extend", async (req, resp) => {
  if (req.user.role != "DEV" && req.user.role != "ROOT") {
    logger.warn({
      event: "license.extend",
      reject_reason: "permission_denied",
      username: req.user.username,
    });
    return resp.status(403).json({ errors: { msg: "Permission denied" } });
  }

  const valid = schemas.validate_extend_license(req.body);

  if (!valid) {
    return resp
      .status(400)
      .json({ errors: schemas.validate_extend_license.errors });
  }

  const app = await app_dao.find_by_name(req.body.application);

  if (app == null) {
    return resp.status(400).json({ errors: { msg: "App not found" } });
  }

  if (app.owner != req.user.id) {
    return resp.status(403).json({ errors: { msg: "Permission denied" } });
  }

  const is_user_exists = await user_dao.exists(req.body.holder);
  if (!is_user_exists ) {
    return resp.status(400).json({ errors: { msg: "User not found" } });
  }

  if (!license_dao.is_user_license_exists(req.body.holder, app.name)) {
    return resp.status(400).json({ errors: { msg: "License not found" } });
  }

  const new_expiration = moment(req.body.valid_until);

  if (!new_expiration.isValid() || new_expiration.isBefore(moment())) {
    return resp.status(400).json({ errors: { msg: "Invalid expiration" } });
  }

  await license_dao.extend_license(
    req.body.holder,
    app.name,
    new_expiration.toDate()
  );

  logger.info({
    event: "license.extend",
    app: app.name,
    user: req.body.holder,
  });

  return resp.status(200).json({ status: "ok" });
});

router.post("/revoke", async (req, resp) => {
  if (req.user.role != "DEV" && req.user.role != "ROOT") {
    logger.warn({
      event: "license.revoke",
      reject_reason: "permission_denied",
      username: req.user.username,
    });
    return resp.status(403).json({ errors: { msg: "Permission denied" } });
  }

  const valid = schemas.validate_revoke_license(req.body);

  if (!valid) {
    return resp
      .status(400)
      .json({ errors: schemas.validate_revoke_license.errors });
  }

  const app = await app_dao.find_by_name(req.body.application);

  if (app == null) {
    return resp.status(400).json({ errors: { msg: "App not found" } });
  }

  if (app.owner != req.user.id) {
    return resp.status(403).json({ errors: { msg: "Permission denied" } });
  }

  const user = await user_dao.find_by_username(req.body.holder);

  if (user == null) {
    return resp.status(400).json({ errors: { msg: "User not found" } });
  }

  await license_dao.revoke_license(req.body.holder, app.name);

    logger.info({
        event: "license.revoke",
        app: app.name,
        user: req.body.holder,
    });

    return resp.status(200).json({ status: "ok" });
});

// User-facing method
router.post("/check", async (req, resp) => {
  const valid = schemas.validate_check_user_license(req.body);

  if (!valid) {
    return resp
      .status(400)
      .json({ errors: schemas.validate_check_user_license.errors });
  }

  const app = await app_dao.find_by_name(req.body.application);
  const user = req.user;

  // don't want to expose to user what went wrong
  const bail = () => {
    return resp.status(403).json({ errors: { msg: "Permission denied" } });
  };

  if (app == null) {
    return bail();
  }

  const is_license_exists = await license_dao.is_user_license_exists(
    user.username,
    app.name
  );

  if (!is_license_exists) {
    logger.error({
      event: "license.check",
      reject_reason: "not_found",
      app: app.name,
      user: user.username,
    });
    return bail();
  }

  const license = await license_dao.get_user_license_for_application(
    user.username,
    app.name
  );

  if (license.status == LicenseStatus.Expired) {
    logger.info({
      event: "license.check",
      reject_reason: "expired",
      app: app.name,
      user: user.username,
    });
    return bail();
  }

  if (license.status == LicenseStatus.Revoken) {
    logger.info({
      event: "license.check",
      reject_reason: "revoken",
      app: app.name,
      user: user.username,
    });
    return bail();
  }

  if (moment(license.valid_until).isBefore(moment())) {
    // marking license as expired
    await license_dao.expire_license(user.username, app.name);
    logger.info({
      event: "license.expire",
      app: app.name,
      user: user.username,
    });
    return bail();
  }

  // all other checks before marking validity
  if (license.machine.hwid != req.body.hwid) {
    logger.info({
      event: "license.check",
      reject_reason: "invalid_hwid",
      app: app.name,
      user: user.username,
    });
    return bail();
  }

  const privateKey = createPrivateKey({
    key: app.secret_key,
    format: "pem",
    type: "pkcs8",
  });

  const signature_body = `${req.body.app_name}:${req.body.license_holder}:${req.body.machine_hwid}:${req.body.nonce}`;

  const signature = createSign("sha256");

  signature.update(signature_body);

  const sign_crypto = signature.sign(privateKey);

  return resp
    .status(200)
    .json({ status: "granted", signature: sign_crypto.toString("base64") });
});

module.exports = router;
