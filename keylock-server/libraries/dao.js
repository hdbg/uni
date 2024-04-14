const models = require("./models");

const { createHash } = require("node:crypto");

function hash_password(password) {
  const hash = createHash("sha256");

  hash.update(password);

  return hash.digest("hex");
}

// The best solution would be to model those as Mongoose models
// ... but you will reject such an solution
// so I am forced to write this...

class UserDAO {
  async find_by_username(username) {
    const user = await models.User.findOne({ username: username }).exec();

    return user;
  }

  async exists(username) {
    const user = await models.User.exists({ username: username }).exec();

    console.log(`user: ${user}`)
    console.log(user != null);

    return user != null;
  }

  async register(username, password, role) {
    const user = new models.User({
      username: username,
      password: password,
      role: role,
      tokens: [],
    });

    await user.save();

    return user;
  }

  // should throw an exception if user do not exist
  async add_token(username, token, valid_until) {
    const user = await models.User.findOne({ username: username }).exec();

    user.tokens.push({ token: token, valid_until: valid_until });

    await user.save();
  }

  async get_tokens(username) {
    const user = await models.User.findOne({ username: username }).exec();

    return user.tokens;
  }

  async revoke_tokens(username, tokens) {
    const user = await models.User.findOne({ username: username }).exec();

    user.tokens = user.tokens.filter((token) => {
      return !tokens.includes(token.token);
    });

    await user.save();
  }

  hash_password(password) {
    return hash_password(password);
  }
}

const user_dao = new UserDAO();
module.exports.user_dao = user_dao;


class ApplicationDAO {
  async find_by_name(name) {
    const application = await models.Application.findOne({ name: name }).exec();
    return application;
  }

  async exists(name) {
    const application = await models.Application.exists({ name: name });
    return application != null;
  }

  async create(name, secret_key, owner_username) {
    const owner = await user_dao.find_by_username(owner_username);

    const application = new models.Application({
      name: name,
      secret_key: secret_key,
      owner: owner,
    });

    await application.save();

    return application;
  }
}

const app_dao = new ApplicationDAO();
module.exports.app_dao = app_dao;


// class MachineDAO {
//     async find_by_hwid(hwid) {
//         const machine = await models.Machine.findOne({ hwid: hwid }).exec();
//         return machine;
//     }

//     async exists(hwid) {
//         const machine = await models.Machine.exists({ hwid: hwid });
//         return machine != null;
    
//     }

//     async create(hwid, owner_username) {
//         const owner = await user_dao.find_by_username(owner_username);

//         const machine = new models.Machine({
//             hwid: hwid,
//             owner: owner,
//         });

//         await machine.save();

//         return machine;
//     }
// }

// const machine_dao = new MachineDAO();
// module.exports.machine_dao = machine_dao;

class LicenseDAO {
    async get_all_user_licenses(holder) {
        const licenses = await models.License.find({ holder: holder }).exec();
        return licenses;
    }

    async get_all_application_licenses(application) {
        const licenses = await models.License.find({ application: application }).exec();
        return licenses;
    }

    async grant_license(holder_username, application_name, machine_hwid, valid_until) {
        const holder = await user_dao.find_by_username(holder_username);
        const application = await app_dao.find_by_name(application_name);

        console.log(valid_until);

        console.log(machine_hwid);

        const license = new models.License({
            holder: holder,
            application: application,
            machine: {hwid: machine_hwid},
            status: models.LicenseStatus.Active,
            valid_until: valid_until,
        });

        await license.save();

        return license;
    }

    async revoke_user_licenses(holder_username, licenses) {
        const holder = await user_dao.find_by_username(holder_username);

        const user_licenses = await this.get_all_user_licenses(holder);

        const revoked_licenses = user_licenses.filter((license) => {
            return licenses.includes(license);
        });

        await models.License.deleteMany({ _id: revoked_licenses.map((license) => license._id) });
    }

    async is_user_license_exists(holder_username, application_name) {
        const holder = await user_dao.find_by_username(holder_username);
        const application = await app_dao.find_by_name(application_name);

        const license = await models.License.findOne({ holder: holder, application: application }).exec();

        return license != null;
    }

    async get_user_license_for_application(holder_username, application_name) {
        const holder = await user_dao.find_by_username(holder_username);
        const application = await app_dao.find_by_name(application_name);


        console.log(`holder: ${holder}, application: ${application}`);
        const license = await models.License.findOne({ holder: holder, application: application }).exec();

        return license;
    }

    async extend_license(holder_username, application_name, new_expiration) {
        const license = await this.get_user_license_for_application(holder_username, application_name);

        license.valid_until = new_expiration;
        license.status = models.LicenseStatus.Active;

        await license.save();
    
    }

    async revoke_license(holder_username, application_name) {
        const holder = await user_dao.find_by_username(holder_username);
        const application = await app_dao.find_by_name(application_name);

        const license = await models.License.findOne({ holder: holder, application: application }).exec();

        license.status = models.LicenseStatus.Revoken;

        await license.save();
    }

    async expire_license(holder_username, application_name) {
        const holder = await user_dao.find_by_username(holder_username);
        const application = await app_dao.find_by_name(application_name);

        const license = await models.License.findOne({ holder: holder, application: application }).exec();

        license.status = models.LicenseStatus.Expired;

        await license.save();
    }
}
module.exports.license_dao = new LicenseDAO();

module.exports.LicenseStatus = models.LicenseStatus;
module.exports.Permissions = models.Permissions;
