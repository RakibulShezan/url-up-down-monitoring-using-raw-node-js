//dependencies
const url = require("url");
const http = require("http");
const https = require("https");
const data = require("./data");
const { parseJSON } = require("../helpers/utilities");
//worker object -module scaffholding

const worker = {};

//lookup all the checks

worker.gatherAllChecks = () => {
  //get all the checks
  data.list("checks", (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach((check) => {
        //read the check data

        data.read("checks", check, (err, originalCheckData) => {
          if (!err && originalCheckData) {
            //pass the data to the check validator
            worker.validateCheckData(parseJSON(originalCheckData));
          } else {
            console.log("Error: Reading one of the checks data");
          }
        });
      });
    } else {
      console.log("Error: Could not find any checks to process");
    }
  });
};

//validate individual check data
worker.validateCheckData = (originalCheckData) => {
  if (originalCheckData && originalCheckData.id) {
    originalCheckData.state =
      typeof originalCheckData.state === "string" &&
      ["up", "down"].indexOf(originalCheckData.state) > -1
        ? originalCheckData.state
        : "down";

    originalCheckData.lastChecked =
      typeof originalCheckData.lastChecked === "number" &&
      originalCheckData.lastChecked > 0
        ? originalCheckData.lastChecked
        : false;

    // pass to the next process
    worker.performCheck(originalCheckData);
  } else {
    console.log("Error: Check was invalid or not properly formatted");
  }
};

//peroform Check
worker.performCheck = (originalCheckData) => {
  //prepare inital outcome
  let checkOutcome = {
    error: false,
    responseCode: false,
  };

  //mark the outcome has not been sent yet
  let outcomeSent = false;
  //parse the hostName & full url from original data
  const parsedUrl = url.parse(
    originalCheckData.protocol + "://" + originalCheckData.url,
    true
  );
  const hostName = parsedUrl.hostname;
  const path = parsedUrl.path;

  //construct the request
  const requestDetails = {
    protocol: originalCheckData.protocol + ":",
    hostname: hostName,
    method: originalCheckData.method.toUpperCase(),
    path: path,
    timeout: originalCheckData.timeOutSeconds * 1000,
  };

  const protocolToUse = originalCheckData.protocol === "http" ? http : https;

  let req = protocolToUse.request(requestDetails, (res) => {
    //grab the status of the response
    const status = res.statusCode;

    //update the check outcome and  pass to the next process
    checkOutcome.responseCode = status;
    if (!outcomeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  req.on("error", (e) => {
    let checkOutcome = {
      error: true,
      value: e,
    };
    if (!outcomeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });
  req.on("timeout", (e) => {
    let checkOutcome = {
      error: true,
      value: "timeout",
    };
    if (!outcomeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  //req send
  req.end();
};

worker.processCheckOutcome = (originalCheckData, checkOutcome) => {
  //check if checkoutcome is up or down

  let state =
    !checkOutcome.error &&
    checkOutcome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1
      ? "up"
      : "down";

  //update the check data
  let newCheckdata = originalCheckData;

  newCheckdata.state = state;
  newCheckdata.lastChecked = Date.now();

  //update the check to database
  data.update("checks", newCheckdata.id, newCheckdata, (err) => {
    if (!err) {
      //send the check data to next process
    } else {
      console.log("Error trying to save check data of one of the checks");
    }
  });
};

//timer to execute the worker process once per minute
worker.loop = () => {
  setInterval(() => {
    worker.gatherAllChecks();
  }, 5000 );
};

//start the workers
worker.init = () => {
  //execute all the checks
  worker.gatherAllChecks();

  //call the loop so that checks continue
  worker.loop();
};

module.exports = worker;
