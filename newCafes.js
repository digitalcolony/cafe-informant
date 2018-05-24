const express = require("express");
const app = express();
const mysql = require("mysql");
const yelp = require("./lib/yelp-api");

const search = {
  categories: `coffee`,
  location: `98003`
};

app.get("/", function(req, res) {
  let report = "";
  yelp
    .search_new_businesses(search.categories, search.location)
    .then(businesses => {
      const num_found = Object.keys(businesses.businesses).length;
      if (num_found === 0) {
        report += `Search returned 0 results.`;
      } else {
        for (let index of businesses.businesses.keys()) {
          report += `<br>[${index + 1}] ${businesses.businesses[index].name}`;
          report += ` ${businesses.businesses[index].location.address1}, ${
            businesses.businesses[index].location.city
          }`;
          let yelp_url = businesses.businesses[index].url;
          let yelp_url_array = yelp_url.split("?");
          report += ` ${yelp_url_array[0]}`;
        }
        report += `<br><br>QUERIED YELP @ ${new Date().toLocaleString()}`;
      }
      res.send(report);
    });
});

const server = app.listen(8081, function() {
  const host = server.address().address;
  const port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
});
