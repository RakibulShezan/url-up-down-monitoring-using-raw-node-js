const url = require("url");
const { StringDecoder } = require("string_decoder");
const routes = require("../routes");
const { notFoundHandler } = require("../handlers/routeHandlers/notFound");
const { parseJSON } = require("../helpers/utilities");
const handler = {};

handler.handleReqRes = (req, res) => {
  //parse the url
  const parsedUrl = url.parse(req.url, true);

  //extract the pathname(about) only from http://localhost:3000/about
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  const method = req.method.toLowerCase();
  const queryStringObject = parsedUrl.query;
  const headersObject = req.headers;

  const requestProperties = {
    parsedUrl,
    path,
    trimmedPath,
    method,
    queryStringObject,
    headersObject,
  };

  const decoder = new StringDecoder("utf-8");
  let realData = "";

  const chosenHandler = routes[trimmedPath]
    ? routes[trimmedPath]
    : notFoundHandler;

  req.on("data", (buffer) => {
    realData += decoder.write(buffer);
  });

  req.on("end", () => {
    realData += decoder.end();
    requestProperties.body = parseJSON(realData);
    chosenHandler(requestProperties, (statusCode, payLoad) => {
      statusCode = typeof statusCode === "number" ? statusCode : 200;
      payLoad = typeof payLoad === "object" ? payLoad : {};
      const payLoadString = JSON.stringify(payLoad);
      //return the final response
      res.setHeader("Content-type", "application/json");
      res.writeHead(statusCode);
      res.end(payLoadString);
    });
  });
};

module.exports = handler;
