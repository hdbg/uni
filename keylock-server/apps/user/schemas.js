const Ajv = require("ajv");
const ajv = new Ajv();


const authSchema = {
  type: "object",
  properties: {
    username: {type: "string"},
    password: {type: "string"}
  },
  required: ["username", "password"]
};
const validate_auth = ajv.compile(authSchema);

const registerSchema = {
  type: "object", 
  properties: {
    username: {type: "string"},
    password: {type: "string"},
    role: {enum: ["USER", "DEV"]}
  },
  required: ["username", "password", "role"]
};
const validate_register = ajv.compile(registerSchema);

module.exports = {
    validate_auth,
    validate_register,
}