const express = require("express");
const app = express();
const yelp = require("./lib/yelp-api");

// Yelp is funny, it will return different results when you mix up the zip code that
// may or may not be related to the distance of the business to that zip code.
// So, this code will cycle through various zips on different days of the week.

// downtown   98101
// Shoreline  98155
// Bellevue   98007
// Tacoma     98401
// Ballard    98107
// W. Seattle 98116
// UW         98195

let d = new Date();
let n = d.getDay();
const zips = [`98101`, `98155`, `98007`, `98401`, `98107`, `98116`, `98195`];

const search = {
  categories: `coffee`,
  location: zips[n]
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
  console.log("Example app listening at http://localhost:8081");
});
