const versionTag = /v\d+\.\d+\.\d+/;
const pullRequestMergeMessage = /^Merge pull request #(\d+)/;


module.exports = async (shortRef, data, config, gh) => {
  if (!versionTag.test(shortRef)) { return; }

  const version = shortRef.slice(1);
  const { commits } = data;

  const [ versionCommit, prCommit ] = commits;

  if (
    !versionCommit ||
    !prCommit ||
    versionCommit.message !== version
  ) {
    return;
  }

  const prMatch = pullRequestMergeMessage.match(prCommit.message);
  if (!prMatch) { return; }
  const pullRequestNum = [ prMatch ];

  await gh.postComment(data.repoPath, pullRequestNum, `The changes in this PR have been released as ${shortRef}`);
};
