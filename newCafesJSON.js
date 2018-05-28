const yelp = require("./lib/yelp-api");
const Client = require("ftp");
const fs = require("fs");
const nodemailer = require("nodemailer");
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
    text: "Job executed!"
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
  const goEmail = await emailMichael();
};

runReport();
