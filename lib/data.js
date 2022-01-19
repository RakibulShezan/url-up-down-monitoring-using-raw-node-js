//dependencies
const fs = require("fs");
const path = require("path");

const lib = {};

// base directory of the data folder
lib.basedir = path.join(__dirname, "/../.data/");

//write data to file
lib.create = function (dir, file, data, callback) {
  fs.open(
    `${lib.basedir + dir}/${file}.json`,
    "wx",
    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        // convert data to string
        const stringData = JSON.stringify(data);

        //write data to file & then close it
        fs.write(fileDescriptor, stringData, function (err) {
          if (!err) {
            fs.close(fileDescriptor, function (err) {
              if (!err) {
                callback(false);
              } else {
                callback("Error closing the new file");
              }
            });
          } else {
            callback("Error writing to new file");
          }
        });
      } else {
        callback(err);
      }
    }
  );
};

// read data from file
lib.read = (dir, file, callback) => {
  fs.readFile(
    lib.basedir + dir + "/" + file + ".json",
    "utf-8",
    (err, data) => {
      callback(err, data);
    }
  );
};

//update existing file
lib.update = (dir, file, data, callback) => {
  //file open for writing
  fs.open(
    `${lib.basedir + dir}/${file}.json`,
    "r+",
    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        //convert data to string

        const stringData = JSON.stringify(data);

        //truncating the file
        fs.ftruncate(fileDescriptor, function (err) {
          if (!err) {
            //write to the file and close it
            fs.write(fileDescriptor, stringData, function (err) {
              if (!err) {
                fs.close(fileDescriptor, function (err) {
                  if (!err) {
                    callback(false);
                  } else {
                    callback("Error closing the new file");
                  }
                });
              } else {
                callback("Error writing to file");
              }
            });
          } else {
            callback("Error on truncating the file");
          }
        });
      } else {
        console.log("Error updating file, may not exists");
      }
    }
  );
};

lib.delete = (dir, file, callback) => {
  //unlnk
  fs.unlink(`${lib.basedir + dir}/${file}.json`, function (err) {
    if (!err) {
      callback(false);
    } else {
      callback("Error deleting file");
    }
  });
};

module.exports = lib;
