//dependencies
const http = require("http");

const { handleReqRes } = require("./helpers/handleReqRes");

const { sendTwilioSms } = require("./helpers/notifications");

//app object -module scaffholding

const app = {};

//testing file system

// @TODO remove later
sendTwilioSms("01797009702", "Hello World", (err) => {
  console.log(`This is the error`, err);
});

//config
app.config = {
  port: 3001,
};

/* //data file create
data.create(
  "test",
  "newFile",
  { name: "Bangladesh", language: "bangla" },
  function (err) {
    console.log(`error was ${err}`);
  }
);

//data file read
data.read("test", "newFile", function (err, result) {
  console.log(err, result);
});

//data file update
data.update(
  "test",
  "newFile",
  { name: "England", language: "English" },
  function (err, result) {
    console.log(err, result);
  }
); */

//data file delete

app.createServer = () => {
  const server = http.createServer(app.handleReqRes);

  server.listen(app.config.port, () => {
    console.log(`Listening to port ${app.config.port}`);
  });
};

//handle request response

app.handleReqRes = handleReqRes;

//start the server
app.createServer();
