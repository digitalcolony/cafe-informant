var env = process.env.NODE_ENV || "development";

if (env === "development") {
  var config = require("./config.json");
  var envConfig = config[env];

  Object.keys(envConfig).forEach(key => {
    process.env[key] = envConfig[key];
  });
}

const envConfig2 = config["ftp_settings"];
Object.keys(envConfig2).forEach(key => {
  process.env[key] = envConfig2[key];
});

const envConfig3 = config["email_settings"];
Object.keys(envConfig3).forEach(key => {
  process.env[key] = envConfig3[key];
});
