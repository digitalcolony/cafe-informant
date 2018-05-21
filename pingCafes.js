const mysql = require("mysql");
const yelp = require("./lib/yelp-api");
require("./config/config");
const RateLimiter = require("limiter").RateLimiter;
let limiter = new RateLimiter(1, 700); //

const connection = mysql.createConnection({
  host: process.env["HOST"],
  database: process.env["DATABASE"],
  user: process.env["USER"],
  password: process.env["PASSWORD"]
});

// Ask YELP if a Cafe is still open

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  const queryCafesWithYelpIDs =
    "SELECT venueName, yelpID FROM venuesclean WHERE yelpID IS NOT NULL AND  venueStatus != yelpStatus";

  connection.query(queryCafesWithYelpIDs, (error, result, fields) => {
    Object.keys(result).forEach(function(key) {
      let row = result[key];
      console.log(`VENUE ${key}: ${row.venueName} - ${row.yelpID}`);
      limiter.removeTokens(1, function() {
        yelp
          .search_business_by_id(row.yelpID)
          .then(cafe => {
            console.log(`Name: ${cafe.name}  Closed: ${cafe.is_closed}`);
            console.log(
              `Reviews: ${cafe.review_count} average: ${cafe.rating}`
            );
            updateVenues(
              connection,
              row.yelpID,
              cafe.is_closed,
              cafe.review_count,
              cafe.rating
            );
          })
          .catch(err => {
            console.error("Error:", err);
            process.exit(1);
          });
      });
      //connection.end();
    });
  });

  const updateVenues = (
    connection,
    yelpID,
    is_closed,
    review_count,
    rating
  ) => {
    let yelpStatus = "";
    if (is_closed === false) {
      yelpStatus = "Active";
    } else {
      yelpStatus = "Inactive";
    }
    const updateSQL = `UPDATE venuesclean SET yelpStatus = '${yelpStatus}',
        yelpReviews = ${review_count}, yelpAverage = ${rating} WHERE yelpID = '${yelpID}'`;
    connection.query(updateSQL, function(error, result) {
      if (error) throw error;
      //console.log(result.affectedRows + " record(s) updated");
    });
  };
});
