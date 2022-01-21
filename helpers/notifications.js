//dependencies
const { stat } = require("fs");
const https = require("https");
const querystring = require("querystring");

const notifications = {};

//send sms to user using twillio api
notifications.sendTwilioSms = (phone, msg, callback) => {
  //input validation
  const userPhone =
    typeof phone === "string" && phone.trim().length === 11
      ? phone.trim()
      : false;

  const userMsg =
    typeof msg === "string" &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (userPhone && userMsg) {
    // configure the request payload
    const payload = {
      From: "+14155552345",
      To: `+88${userPhone}`,
      Body: userMsg,
    };

    // Stringify the payload

    const stringifyPayload = JSON.stringify(payload);
    console.log(stringifyPayload);
    const twillioAuth = {
      accountSid: "AC631b789b1ee6c76d15c301ffa48d1984",
      authToken: "85b23e2787eb23cbb0ab7c0602593659",
    };
    // configure the request details
    const requestDetails = {
      hostname: "api.twilio.com",
      method: "POST",
      path: `/2010-04-01/Accounts/${twillioAuth.accountSid}/Messages.json`,
      auth: `${twillioAuth.accountSid}:${twillioAuth.authToken}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    console.log(requestDetails);
    //instantiate the request object
    const req = https.request(requestDetails, (res) => {
      //get the status of the sent request
      const status = res.statusCode;
      // callback successfully if the request went through
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });
    //error event listener on request error
    req.on("error", (e) => {
      callback(e);
    });
    //add payload
    req.write(stringifyPayload);
    req.end();
  } else {
    callback("Given parameters were invalid");
  }
};

module.exports = notifications;
