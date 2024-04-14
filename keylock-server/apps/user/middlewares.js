const express = require("express");
const moment = require("moment");
const { user_dao, Permissions } = require("../../libraries/dao");

const TEMP_SECRET = "TEST_SECRET";
var jwt = require("jsonwebtoken");

const enforce_user_auth = async function (req, resp, next) {
  const token = req.get("Authorization");

  if (token == null) {
    return resp
      .status(401)
      .json({ errors: { msg: "Authorization header is missing", code: "TOKEN_MISSING" } });
  }

  try {
    var decoded = jwt.verify(token, TEMP_SECRET);

    const user = await user_dao.find_by_username(decoded.username);

    const bail = () => {
      return resp
        .status(403)
        .json({ errors: { msg: "Authorization header is invalid", code: "INVALID_TOKEN" } });
    };

    if (user == null) {
      return bail();
    }

    const is_registered_token = user.tokens.some((t) => t.token == token);

    if (!is_registered_token) {
      return bail();
    }

    req.user = user;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      user_dao.revoke_tokens(user.username, [token]);
      logger.info({
        event: "user.token_expired",
        username: user.username,
      });
    }
    return resp
      .status(403)
      .json({ errors: { msg: "Authorization header is invalid", code: "INVALID_TOKEN" } });
  }
  next();
};

const enforce_permissioned_user = async function (req, resp, next) {
  return await enforce_user_auth(req, resp, () => {
    if ([Permissions.Root, Permissions.Developer].includes(req.user.role)) {
      next();
    } else {
      return resp.status(403).json({ errors: { msg: "Permission denied", code: "ACCESS_DENIED" } });
    }
  });
};

module.exports = {
  enforce_user_auth,
  enforce_permissioned_user,
};
