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

  getConfig (repoPath) {
    return this.get(`/repos/${repoPath}/contents/.maintainerd`)
      .then(response => response.json())
      .then(json => Buffer.from(json.content, "base64").toString())
      .then(yamlString => load(yamlString, "utf8"));
  }

  updateCommit (repoPath, sha, failureMessage) {
    const state = failureMessage ? "pending" : "success";
    const description = failureMessage ? failureMessage : "maintainerd thanks you!";

    const [ org, repo ] = repoPath.split("/");
    const queryString = qs.stringify({
      org,
      repo,
      sha
    });

    return this.post(`/repos/${repoPath}/statuses/${sha}?${queryString}`, JSON.stringify({
      state,
      description: description || "",
      context: "divmain/maintainerd"
    }));
  }
}
