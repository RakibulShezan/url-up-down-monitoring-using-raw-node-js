//dependencies
const http = require("http");

const { handleReqRes } = require("../helpers/handleReqRes");

//server object -module scaffholding

const server = {};

//testing file system

//config
server.config = {
  port: 3001,
};

//create server
server.createServer = () => {
  const createServerVariable = http.createServer(server.handleReqRes);

  createServerVariable.listen(server.config.port, () => {
    console.log(`Listening to port ${server.config.port}`);
  });
};

//handle request response

server.handleReqRes = handleReqRes;

//start the server
server.init = () => {
  server.createServer();
};

module.exports = server;
