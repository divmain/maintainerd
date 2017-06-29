const { flow, map, find } = require("lodash/fp");
const _ = require("lodash");


const checkSubjectWith = ({ subject = {} }) => {
  const {
    mustHaveLengthBetween,
    mustMatch,
    mustNotMatch
  } = subject;
  const [ maxSubjectLen, minSubjectLen ] = mustHaveLengthBetween || [];

  return ({ commit: { message }, sha }) => {
    const shortSha = sha.slice(0, 7);
    const commitSubject = message.split("\n")[0];

    if (mustHaveLengthBetween) {
      if (commitSubject.length > maxSubjectLen) { return `Subject for ${shortSha} is too long.`; }
      if (commitSubject.length < minSubjectLen) {
        return `Subject for ${shortSha} is too short.`;
      }
    }
    if (
      mustMatch && !mustMatch.test(commitSubject) ||
      mustNotMatch && mustNotMatch.test(commitSubject)
    ) {
      return `Subject for ${shortSha} does not meet content requirements.`
    }
  };
};

const checkSubjects = (commitConfig, commitEntries) => _.chain(commitEntries)
  .map(checkSubjectWith(commitConfig))
  .find()
  .value();

const checkMessageWith = ({ subject = {}, message = {} }) => {
  const {
    maxLines,
    minLines
  } = message;

  return ({ commit: { message }, sha }) => {
    const shortSha = sha.slice(0, 7);

    const commitLines = message.split("\n").length;

    if (maxLines && commitLines > maxLines) {
      return `Commit message for ${shortSha} is too long.`
    }
    if (minLines && commitLines < minLines) {
      return `Commit message for ${shortSha} is too short.`
    }
  };
};

const checkMessages = (commitConfig, commitEntries) => _.chain(commitEntries)
  .map(checkMessageWith(commitConfig))
  .find()
  .value();

module.exports = async (pullRequestData, config, gh) => {
  if (!config.commit) { return; }

  const { repoPath, pullRequestNumber, sha } = pullRequestData;
  const commitEntries = await gh.getPullRequestCommits(repoPath, pullRequestNumber);

  const subjectFailureMessage = checkSubjects(config.commit, commitEntries);
  await gh.updateCommit(repoPath, sha, "subject", subjectFailureMessage);

  const messageFailureMessage = checkMessages(config.commit, commitEntries);
  await gh.updateCommit(repoPath, sha, "msg", messageFailureMessage);
};
