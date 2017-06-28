require("dotenv").config();

[
  "TOKEN",
  "ISS",
  "CLIENT_ID",
  "CLIENT_SECRET",
  "REGEXP_TIMEOUT"
].forEach(key => {
  module.exports[key] = process.env[key];
});
