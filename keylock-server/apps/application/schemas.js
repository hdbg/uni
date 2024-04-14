const Ajv = require("ajv");
const ajv = new Ajv();


const createAppSchema = {
  type: "object",
  properties: {
    name: {type: "string"},
  },
  required: ["name"]
};
const validate_create_app = ajv.compile(createAppSchema);

const getAppPublicKey = {
    type: "object",
    properties: {
        name: {type: "string"},
    },
    required: ["name"]
    
};
const validate_get_app_public_key = ajv.compile(getAppPublicKey);

module.exports = {
    validate_create_app,
    validate_get_app_public_key,
}