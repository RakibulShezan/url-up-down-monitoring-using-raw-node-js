//dependencies
const crypto = require("crypto");
//module scaffholding

const utilities = {};

//parse JSON string to object
utilities.parseJSON = (jsonString) => {
  let output = {};

  try {
    output = JSON.parse(jsonString);
  } catch {
    output = {};
  }
  return output;
};

// hash string
utilities.hash = (string) => {
  if (typeof string === "string" && string.length > 0) {
    let hash = crypto
      .createHmac("sha256", "asjdhasdhjkah")
      .update(string)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

// Create random string(Token)
utilities.createRandomString = (strLength) => {
  let length = strLength;
  length = typeof strLength === "number" && strLength > 0 ? strLength : false;
  if (length) {
    let possibleCharacters = "abcdefghijklmnopqrstuvwxyz1234567890";
    let output = "";
    for (let i = 1; i <= length; i += 1) {
      let randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      output += randomCharacter;
    }
    return output;
  } else return false;
};

module.exports = utilities;
