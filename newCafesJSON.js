const yelp = require("./lib/yelp-api");
const Client = require("ftp");
const fs = require("fs");
const nodemailer = require("nodemailer");
require("./config/config");

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

const localFile = "./report/newcafes.json";
const serverFile = "/coffeeclub.app/public_html/src/data/newcafes.json";

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
    host: process.env["FTP_HOST"],
    user: process.env["FTP_USER"],
    password: process.env["FTP_PASSWORD"]
  });
};

const emailMichael = async () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env["EMAIL"],
      pass: process.env["EMAIL_PASSWORD"]
      // GMAIL TIP: create device password @ https://myaccount.google.com/security --> App Passwords
    }
  });

  const mailOptions = {
    from: process.env["EMAIL"],
    to: process.env["EMAIL"],
    subject: "Cafe Informant",
    text: "Job executed! => https://coffeeclub.app/leads.php"
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

const runReport = async () => {
  const goYelp = await getNewCafeData();
  const goFTP = await uploadNewCafeData();
 // const goEmail = await emailMichael();
};

runReport();
