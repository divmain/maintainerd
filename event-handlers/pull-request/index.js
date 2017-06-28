const handlePullRequestAction = require("./handle-action");


const extractPRMetadata = payload => ({
  action: payload.action,
  installationId: payload.installation.id,
  repoPath: payload.repository.full_name,
  sha: payload.pull_request.head.sha,

  title: payload.pull_request.title,
  userId: payload.sender.login,

  body: payload.pull_request.body,
  changes: payload.pull_request.changes
});


module.exports = async (req, res) => {
  const payload = await json(req);
  await handlePullRequestAction(extractPRMetadata(payload));
  return send(res, 200);
};
