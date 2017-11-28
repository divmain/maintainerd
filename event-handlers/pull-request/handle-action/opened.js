const editedHandler = require("./edited");
const synchronizeHandler = require("./synchronize");


module.exports = async (pullRequestData, config, gh) => {
  const { repoPath, sha, pullRequestNumber } = pullRequestData;
  const { log: enableLog } = config;

  const existingLogComment = await gh.getLogComment(repoPath, pullRequestNumber);
  if (!existingLogComment && enableLog) {
    await gh.createLogPost(repoPath, pullRequestNumber, sha);
  }

  await editedHandler(pullRequestData, config, gh);
  await synchronizeHandler(pullRequestData, config, gh);
};
