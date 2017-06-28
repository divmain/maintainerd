const handlePullRequestAction = require("./handle-action");


const extractPrData = payload => ({
  action: payload.action,
  installationId: payload.installation.id,
  repoPath: payload.repository.full_name,
  sha: payload.pull_request.head.sha,

  title: payload.pull_request.title,
  pullRequestNumber: payload.pull_request.number,
  userId: payload.sender.login,

  body: payload.pull_request.body,
  changes: payload.pull_request.changes,
  state: payload.pull_request.state,
  base: payload.pull_request.base
});


module.exports = async (payload, config, gh) => {
  await handlePullRequestAction(extractPrData(payload), config, gh);
};
