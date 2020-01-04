const fs = require("fs");

const JSONfolder = "./report/";

fs.readdir(JSONfolder, function(err, list) {
  if (err) throw err;
  list.forEach(function(file) {
    let thisJSON = JSONfolder + file;
    fs.readFile(thisJSON, function(err2, data) {
      if (err2) throw err2;
      let thisJSON = JSON.parse(data);
      for (let i = 0; i < thisJSON.businesses.length; i++) {
        let thisCafe = thisJSON.businesses[i];
        console.log(i, thisCafe.alias);
      }
    });
  });
});

// load JSON files from folder into array

// open JSON files, build array

// write array to combined JSON file
