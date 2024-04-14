const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const logger = require("./logger")

const Permissions = {
  Root: "ROOT",
  Developer: "DEV",
  User: "USER"
};

const LicenseStatus = {
  Active: "ACTIVE",
  Revoken: "REVOKEN",
  Expired: "EXPIRED"
}

const authTokenSchema = new Schema({
  valid_until: Date,
  token: String,
});

const applicationSchema = new Schema({
  name: String,
  secret_key: String, // server's RSA secret key for this particular application,
  owner: {type: mongoose.Schema.ObjectId, ref: "User"}
})

// added as separate from license schema in order to
// faciliate future actor-dependent logs
// for example one user might have licenses for different application
// therefore logs would be added to those licenses and for machine as well
// *I wonder if it is allowed by GDPR*
const machineSchema = new Schema({
  hwid: {type: String, required: true},
});

const userSchema = new Schema({
  username: String,
  password: {type: String, required: true}, // hashed string
  role: {
    type: String,
    required: true,
    enum: Object.values(Permissions)
  },
  tokens: [authTokenSchema]
});

const licenseSchema = new Schema({
  holder: {type: Schema.ObjectId, ref: "User"},
  application: {type: Schema.ObjectId, ref: "Application"},
  machine: machineSchema,

  status: {type: String, enum: Object.values(LicenseStatus), required: true},

  valid_until: {type: Date, required: true}, 
});

const Application = mongoose.model("Application", applicationSchema);
// const Machine = mongoose.model("Machine", machineSchema);
const User = mongoose.model("User", userSchema);
const License = mongoose.model("License", licenseSchema);

async function connect() {
   logger.info({event: "database.connecting"});
   await mongoose.connect(process.env.MONGODB);
   logger.info({event: "database.connected"});

}

module.exports = {
  Application: Application,
  // Machine: Machine,
  User: User,
  License: License,

  // Enums
  LicenseStatus: LicenseStatus,
  Permissions: Permissions,

  // Misc,
  connect
}
