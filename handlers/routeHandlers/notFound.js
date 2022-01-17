const handler = {};

handler.notFoundHandler = (requestProperties, callBack) => {
  console.log("Not Found");
  callBack(404, {
    message: "Your requested url was not found",
  });
};

module.exports = handler;
