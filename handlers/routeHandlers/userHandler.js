const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");

const handler = {};

handler.userHandler = (requestProperties, callBack) => {
  const acceptedMethods = ["get", "post", "put", "delete"];

  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callBack);
  } else {
    callBack(405);
  }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  const tosAgreement =
    typeof requestProperties.body.tosAgreement === "boolean"
      ? requestProperties.body.tosAgreement
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure that the user doesn't already exist

    data.read("users", phone, (err) => {
      if (err) {
        let userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };
        //strore the user to db
        data.create("users", phone, userObject, (err) => {
          if (!err) {
            callback(200, {
              message: "User was created successfully",
            });
          } else {
            callback(500, {
              error: "Couldn't create user",
            });
          }
        });
      } else {
        callback(500, {
          error: "There was a problem in server side",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a problem in your request",
    });
  }
};

handler._users.get = (requestProperties, callback) => {
  //check the phone number  is valid
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  if (phone) {
    //lookup the user
    data.read("users", phone, (err, userData) => {
      const user = { ...parseJSON(userData) }; //makes the string data to valid object and copies the object to user variable
      if (!err && user) {
        delete user.password;
        callback(200, user);
      } else {
        callback(404, {
          error: "Requested user not found",
        });
      }
    });
  } else {
    callback(404, {
      error: "Requested user not found",
    });
  }
};
handler._users.put = (requestProperties, callback) => {
  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phone) {
    if (firstName || lastName || password) {
      //lookup the user
      data.read("users", phone, (err, user) => {
        const userData = { ...parseJSON(user) };
        if (!err && userData) {
          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            userData.lastName = lastName;
          }
          if (password) {
            userData.password = hash(password);
          }

          //strore or update database
          data.update("users", phone, userData, (err) => {
            if (!err) {
              callback(200, {
                message: "User was updated successfully",
              });
            } else {
              callback(500, {
                error: "There was a problem in the server side",
              });
            }
          });
        } else {
          callback(404, {
            error: "Requested user not found",
          });
        }
      });
    } else {
      callback(400, {
        error: "You have a problem in your request",
      });
    }
  } else {
    callback(400, {
      error: "Invalid Phone Number",
    });
  }
};
handler._users.delete = (requestProperties, callback) => {
  //check the phone number  is valid
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;
  if (phone) {
    //lookup the user
    data.read("users", phone, (err, userData) => {
      if (!err && userData) {
        data.delete("users", phone, (err) => {
          if (!err) {
            callback(200, {
              message: "User deleted successfully",
            });
          } else {
            callback(500, {
              error: "Server Side Errror",
            });
          }
        });
      } else {
        callback(404, {
          error: "Requested user not found",
        });
      }
    });
  } else {
    callback(404, {
      error: "Requested user not found",
    });
  }
};

module.exports = handler;
