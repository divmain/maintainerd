const fetch = require("node-fetch");
const qs = require("qs");
const { load } = require("js-yaml");
const { includes, find } = require("lodash");

const { getInstallationToken } = require("./installation-token");


const NEXT_ENTRY_MARKER = "<!-- log tail -->";

const timeStamp = () => new Date().toISOString();
const getNewLog = sha => getUpdatedLog(`[maintainerd](http://maintainerd.divmain.com/) logging is enabled for this repository.

All actions related to rules and their enforcement will be logged here as a permanent record.

---

<details>
<summary>Click to view log...</summary>
<p>

${NEXT_ENTRY_MARKER}

</p></details>
`, sha, "The pull request was created");

const getUpdatedLog = (oldLog, sha, entry) => oldLog.replace(
  NEXT_ENTRY_MARKER,
  ` - \`${timeStamp()}:${sha.slice(0, 7)}\`: ${entry}\n${NEXT_ENTRY_MARKER}`
);

exports.GitHub = class GitHub {
  constructor (installationId) {
    this.installationId = installationId;
  }

  get (urlSegment) {
    return this.fetch("GET", urlSegment);
  }

  post (urlSegment, body) {
    return this.fetch("POST", urlSegment, JSON.stringify(body));
  }

  patch (urlSegment, body) {
    return this.fetch("PATCH", urlSegment, JSON.stringify(body));
  }

  async fetch (method, urlSegment, body) {
    const installationToken = await getInstallationToken(this.installationId);

    const headers = {
      "User-Agent": "divmain/maintainerd",
      "Accept": "application/vnd.github.machine-man-preview+json",
      "Authorization": `token ${installationToken}`
    };
    const opts = {
      method,
      headers
    };

    if (method === "POST" || method === "PATCH" || method === "PUT") {
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

  updateCommit (repoPath, sha, context, failureMessage) {
    const state = failureMessage ? "failure" : "success";
    const description = failureMessage ? failureMessage : "maintainerd thanks you!";

    const [ org, repo ] = repoPath.split("/");
    const queryString = qs.stringify({
      org,
      repo,
      sha
    });

    return this.post(`/repos/${repoPath}/statuses/${sha}?${queryString}`, {
      state,
      description: description || "",
      context
    });
  }

  async getPullRequest(repoPath, pullRequestNumber) {
    const response = await this.get(`/repos/${repoPath}/pulls/${pullRequestNumber}`);
    return response.json();
  }

  updatePullRequest (pullRequestData, patchJson) {
    const { pullRequestNumber, repoPath } = pullRequestData;
    return this.patch(`/repos/${repoPath}/pulls/${pullRequestNumber}`, patchJson);
  }

  async getPullRequestCommits (repoPath, pullRequestNumber) {
    const response = await this.get(`/repos/${repoPath}/pulls/${pullRequestNumber}/commits`);
    return response.json();
  }

  async postComment (repoPath, issueNumber, body) {
    const response = await this.post(`/repos/${repoPath}/issues/${issueNumber}/comments`, {
      body
    });
    return response.json();
  }

  async createLogPost (repoPath, pullRequestNumber, sha) {
    return this.postComment(repoPath, pullRequestNumber, getNewLog(sha));
  }

  async getComments (repoPath, issueNumber) {
    const response = await this.get(`/repos/${repoPath}/issues/${issueNumber}/comments`);
    return response.json();
  }

  async getLogComment (repoPath, issueNumber) {
    const comments = await this.getComments(repoPath, issueNumber);
    return find(comments, comment => includes(comment.body, NEXT_ENTRY_MARKER));
  }

  async updateLogPost (repoPath, pullRequestNumber, sha, logEntry) {
    const logComment = await this.getLogComment(repoPath, pullRequestNumber);
    if (!logComment) { return; }

    const { id, body } = logComment;
    const newBody = getUpdatedLog(body, sha, logEntry);
    const response = await this.patch(`/repos/${repoPath}/issues/comments/${id}`, {
      body: newBody
    });
    return response.json();
  }
};
