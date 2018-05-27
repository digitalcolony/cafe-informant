const yelp = require("./lib/yelp-api");
const Client = require("ftp");
const fs = require("fs");
require("./config/config");

const search = {
  categories: `coffee`,
  location: `98003`
};

const localFile = "./report/newcafes.json";
const serverFile = "/public_html/coffeeclub.app/i/newcafes.json";

const getNewCafeData = async () => {
  yelp
    .search_new_businesses(search.categories, search.location)
    .then(businesses => {
      fs.writeFileSync(localFile, JSON.stringify(businesses));
    });
};

const uploadNewCafeData = async () => {
  const c = new Client();
  c.on("ready", function() {
    c.put(localFile, serverFile, function(err) {
      if (err) throw err;
      c.end();
    });
  });
  c.connect({
    host: process.env["host"],
    user: process.env["user"],
    password: process.env["password"]
  });
};

const runReport = async () => {
  const goYelp = await getNewCafeData();
  const goFTP = await uploadNewCafeData();
};

runReport();
