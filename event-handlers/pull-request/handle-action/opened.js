const { build: buildChecklist } = require("../checklist");


module.exports = async (pullRequestData, config, gh) => {
  const { body } = pullRequestData;
  const newBody = buildChecklist(body, config);
  await gh.updatePullRequest(pullRequestData, { body: newBody });
};
