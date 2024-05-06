const express = require("express");
const logger = require("../../libraries/logger");
const { generateKeyPair, createPublicKey } = require("crypto");
const { promisify } = require("util");

const { enforce_permissioned_user } = require("../user/middlewares");

const { app_dao } = require("../../libraries/dao");

const router = express.Router();
const schemas = require("./schemas");

router.use(enforce_permissioned_user);

async function generate_rsa_key(bits) {
  const generateKeyPairAsync = promisify(generateKeyPair);

  return await generateKeyPairAsync("rsa", {
    modulusLength: bits,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
}

router.post("/create", async (req, resp) => {
  const valid = schemas.validate_create_app(req.body);

  if (!valid) {
    return resp
      .status(400)
      .json({ errors: schemas.validate_create_app.errors });
  }

  if (await app_dao.exists(req.body.name)) {
    return resp.status(400).json({ errors: { msg: "App already exists", code: "DUPLICATE_APP"  } });
  }

  const { _, privateKey } = await generate_rsa_key(2048);

  const app = await app_dao.create(
    req.body.name,
    privateKey,
    req.user.username
  );

  logger.info({ event: "app.create", app: app.name });

  return resp.status(200).json({ status: "ok" });
});

router.get("/public_key", async (req, resp) => {
  const valid = schemas.validate_get_app_public_key(req.body);

  if (!valid) {
    return resp
      .status(400)
      .json({ errors: schemas.validate_get_app_public_key.errors });
  }

  const app = await app_dao.find_by_name(req.body.name);

  if (app == null) {
    return resp.status(400).json({ errors: { msg: "App not found" } });
  }

  const public_key = createPublicKey(app.secret_key).export({
    type: "spki",
    format: "pem",
  });

  console.log(public_key);

  return resp
    .status(200)
    .json({ status: "ok", data: { public_key: public_key } });
});

router.get("/list", async (req, resp) => {
  var app = await app_dao.get_all_applications(req.user.username);

  app = app.map((app) => {
    const public_key = createPublicKey(app.secret_key).export({
      type: "spki",
      format: "pem",
    });
    return {
      name: app.name,
      public_key: public_key,
    };
  });
  return resp
    .status(200)
    .json({ status: "ok", data: app });
});

module.exports = router;
