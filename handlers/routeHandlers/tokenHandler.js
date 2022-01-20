const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { createRandomString, parseJSON } = require("../../helpers/utilities");

const handler = {};

handler.tokenHandler = (requestProperties, callBack) => {
  const acceptedMethods = ["get", "post", "put", "delete"];

  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._token[requestProperties.method](requestProperties, callBack);
  } else {
    callBack(405);
  }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
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

  if (phone && password) {
    data.read("users", phone, (err, userData) => {
      let hashedPassword = hash(password);
      if (hashedPassword === parseJSON(userData).password) {
        let tokenId = createRandomString(20);
        let expires = Date.now() + 60 * 60 * 1000;
        let tokenObj = {
          phone: phone,
          id: tokenId,
          expires: expires,
        };

        //store the token to database
        data.create("tokens", tokenId, tokenObj, (err) => {
          if (!err) {
            callback(200, tokenObj);
          } else {
            callback(500, {
              error: "There was a problem in the server",
            });
          }
        });
      } else {
        callback(400, {
          error: "Password is not valid",
        });
      }
    });
  }
};

handler._token.get = (requestProperties, callback) => {
  // check the id if valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // lookup the token
    data.read("tokens", id, (err, tokenData) => {
      const token = { ...parseJSON(tokenData) };
      if (!err && token) {
        callback(200, token);
      } else {
        callback(404, {
          error: "Requested token was not found!",
        });
      }
    });
  } else {
    callback(404, {
      error: "Requested token was not found!",
    });
  }
};
handler._token.put = (requestProperties, callback) => {
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;
  const extend =
    typeof requestProperties.body.extend === "boolean" &&
    requestProperties.body.extend === true
      ? true
      : false;
  if (id && extend) {
    data.read("tokens", id, (err, tokenData) => {
      let tokenObj = parseJSON(tokenData);
      if (!err) {
        if (tokenObj.expires > Date.now()) {
          tokenObj.expires = Date.now() + 60 * 60 * 1000; ///extend by 1 hour

          //store the updated token
          data.update("tokens", id, tokenObj, (err) => {
            if (!err) {
              callback(200, tokenObj);
            } else {
              callback(500, {
                error: "There was a problem in the server",
              });
            }
          });
        } else {
          callback(400, {
            error: "Token already expired!!",
          });
        }
      } else {
        callback(404, {
          error: "Requested token was not found!",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was a problem in your request",
    });
  }
};
handler._token.delete = (requestProperties, callback) => {
  //check the token is valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    //lookup the token
    data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        data.delete("tokens", id, (err) => {
          if (!err) {
            callback(200, {
              message: "Token deleted successfully",
            });
          } else {
            callback(500, {
              error: "Server Side Errror",
            });
          }
        });
      } else {
        callback(404, {
          error: "Requested token not found",
        });
      }
    });
  } else {
    callback(404, {
      error: "Requested token not found",
    });
  }
};

handler._token.verify = (id, phone, callback) => {
  data.read("tokens", id, (err, tokenData) => {
    if (!err && tokenData) {
      if (
        parseJSON(tokenData).phone === phone &&
        parseJSON(tokenData).expires > Date.now()
      ) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = handler;
