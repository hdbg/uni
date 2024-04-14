const Ajv = require("ajv");
const ajv = new Ajv();

const grant_license_schema = {
    type: "object",
    properties: {
        application: {type: "string"},
        hwid: {type: "string"},
        holder: {type: "string"},
        valid_until: {type: "number"},
    },
    required: ["application", "hwid", "valid_until", "holder"]
    
};

const check_user_license_schema = {
  type: "object",
  properties: {
    application: {type: "string"},
    hwid: {type: "string"},
    nonce: {type: "string"},
  },
  required: ["application", "hwid", "nonce"]
};

const revoke_license_schema = {
    type: "object",
    properties: {
        holder: {type: "string"},
        application: {type: "string"},
    },
    required: ["application", "holder"]
    
};

const extend_license_schema = {
    type: "object",
    properties: {
        holder: {type: "string"},
        application: {type: "string"},
        valid_until: {type: "number"},
    },
    required: ["holder", "valid_until", "application"]

};


const validate_check_user_license = ajv.compile(check_user_license_schema);
const validate_revoke_license = ajv.compile(revoke_license_schema);
const validate_extend_license = ajv.compile(extend_license_schema);
const validate_grant_license = ajv.compile(grant_license_schema);

module.exports = {
    validate_check_user_license,
    validate_revoke_license,
    validate_extend_license,
    validate_grant_license
};