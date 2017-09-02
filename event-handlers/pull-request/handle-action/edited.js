const {
  build: buildChecklist,
  isPresent: checklistIsPresent,
  checkEntries,
  checkSemver,
  getLogEntry
} = require("../checklist");


module.exports = async (pullRequestData, config, gh) => {
  let { body, repoPath, sha, changes, userId, pullRequestNumber } = pullRequestData;

  // The user is not allowed to remove the checklist.
  if (!checklistIsPresent(body)) {
    body = buildChecklist(body, config);
    await gh.updatePullRequest(pullRequestData, { body });
  }

  if (changes && changes.body && changes.body.from) {
    const logEntry = getLogEntry(changes.body.from, body, userId);
    if (logEntry) {
      await gh.updateLogPost(repoPath, pullRequestNumber, sha, logEntry);
    }
  }

  const failureMessage =
    checkEntries(body) ||
    checkSemver(body) ||
    null;

  await gh.updateCommit(repoPath, sha, "body", failureMessage);
};
