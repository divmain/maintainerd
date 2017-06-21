const fetch = require("node-fetch");
const qs = require("qs");
const { load } = require("js-yaml");

const { getInstallationToken } = require("./installation-token");


module.exports.GitHub = class GitHub {
  constructor (installationId) {
    this.installationId = installationId;
  }

  get (urlSegment) {
    return this.fetch("GET", urlSegment);
  }

  post (urlSegment, body) {
    return this.fetch("POST", urlSegment, body);
  }

  async fetch (method, urlSegment, body) {    
    const installationToken = await getInstallationToken(this.installationId);

    const headers = {
      "User-Agent": "divmain/semver-as-a-service",
      "Accept": "application/vnd.github.machine-man-preview+json",
      "Authorization": `token ${installationToken}`
    };
    const opts = {
      method,
      headers
    };

    if (method === "POST") {
      headers["Content-Type"] = "application/json";
      opts.body = body;
    }

    return fetch(`https://api.github.com${urlSegment}`, opts);
  }
}
