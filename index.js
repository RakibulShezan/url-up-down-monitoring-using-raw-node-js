//dependencies
const http = require("http");

const { handleReqRes } = require("./helpers/handleReqRes");

const server = require("./lib/server");
const worker = require("./lib/worker");

//app object -module scaffholding

const app = {};

app.init = () => {
  //start the server
  server.init();

  //start the workers
  worker.init();
};

app.init();
