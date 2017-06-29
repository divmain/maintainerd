const { includes } = require("lodash");

const {
  build: buildChecklist,
  isPresent: checklistIsPresent,
  checkEntries,
  checkSemver
} = require("../checklist");


module.exports = async (pullRequestData, config, gh) => {
  let { body, repoPath, sha } = pullRequestData;

  // The user is not allowed to remove the checklist.
  if (!checklistIsPresent(body)) {
    body = buildChecklist(body, config);
    await gh.updatePullRequest(pullRequestData, { body });
  }

  const failureMessage =
    checkEntries(body) ||
    checkSemver(body) ||
    null;

  await gh.updateCommit(repoPath, sha, "body", failureMessage);
};
