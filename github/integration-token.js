const { readFileSync } = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const { ISS } = require("../config");

const cert = readFileSync(path.resolve(__dirname, "../private.pem"));
const iss = parseInt(ISS, 10);
const expiration = 300; // seconds

const now = () => (Date.now() / 1000) | 0;

let activeToken;
module.exports.getIntegrationToken = () => {
  const iat = now();

  if (
    activeToken &&
    (iat - activeToken.iat < (expiration - 30))
  ) {
    return activeToken.token;
  }

  const token = jwt.sign(
    {
      exp: iat + expiration,
      iat,
      iss
    },
    cert,
    { algorithm: "RS256" }
  );

  activeToken = {
    iat,
    token
  };

  return token;
};
