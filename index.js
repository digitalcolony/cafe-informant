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

connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  const queryAllCafes = `SELECT venueID, venueName, address_1, city, state, country FROM venuesclean 
    WHERE yelpID IS NULL AND venueType='Standard' AND Country = 'US' ORDER BY RAND()  `;

  connection.query(queryAllCafes, (error, result, fields) => {
    // if any error while executing above query, throw error
    //if (error) throw err;
    // if there is no error, you have the result
    // iterate for all the rows in result
    Object.keys(result).forEach(function(key) {
      let row = result[key];
      console.log(
        `VENUE ${key}: ${row.venueName} - ${row.address_1}, ${row.city}`
      );
      limiter.removeTokens(1, function() {
        yelp
          .search_business_by_match(
            row.venueName,
            row.address_1,
            row.city,
            row.state,
            "",
            row.country,
            "",
            ""
          )
          .then(businesses => {
            const num_found = Object.keys(businesses.businesses).length;
            console.log(`VenueID: ${row.venueID}`);
            if (num_found === 0) {
              console.log(`Search returned 0 results`);
            } else {
              for (let index of businesses.businesses.keys()) {
                let yelpID = businesses.businesses[index].id;
                let venueID = row.venueID;
                //console.log(`Found: ${businesses.businesses[index].id}`);
                updateVenues(connection, venueID, yelpID);
              }
            }
          })
          .catch(err => {
            console.error("Error:", err);
            process.exit(1);
          });
      });
    });
    connection.end();
  });

  const updateVenues = (connection, venueID, yelpID) => {
    const updateSQL = `UPDATE venuesclean SET yelpID = '${yelpID}' 
      WHERE venueID = ${venueID}`;
    connection.query(updateSQL, function(error, result) {
      if (error) throw error;
      console.log(result.affectedRows + " record(s) updated");
    });
  };
});
