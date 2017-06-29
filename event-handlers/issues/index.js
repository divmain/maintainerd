const handlePullRequestAction = require("./handle-action");


const extractData = payload => ({
  action: payload.action,
  installationId: payload.installation.id,
  repoPath: payload.repository.full_name,

  actionTarget:
    payload.label && payload.label.name ||
    payload.assignee && payload.assignee.login ||
    null
  ,
  actionMaker: payload.sender.login,

  issue: {
    number: payload.issue.number,
    title: payload.issue.title,
    body: payload.issue.body,
    creator: payload.issue.user.login,
    labels: payload.issue.labels.map(labelData => labelData.name),
    assignees: payload.issue.assignees.map(assignee => assignee.login)
  }
});


module.exports = async (payload, config, gh) => {
  await handlePullRequestAction(extractData(payload), config, gh);
};
