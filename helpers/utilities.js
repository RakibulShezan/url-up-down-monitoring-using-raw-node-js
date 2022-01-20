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

module.exports = utilities;
