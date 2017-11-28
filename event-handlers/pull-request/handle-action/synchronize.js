const { chain, some } = require("lodash");


const checkSubjectWith = ({ subject = {} }) => {
  const {
    mustHaveLengthBetween,
    mustMatch,
    mustNotMatch
  } = subject;
  const [ minSubjectLen, maxSubjectLen ] = mustHaveLengthBetween || [];

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
      return `Subject for ${shortSha} does not meet content requirements.`;
    }
  };
};

const checkSubjects = (commitConfig, commitEntries) => chain(commitEntries)
  .map(checkSubjectWith(commitConfig))
  .find()
  .value();

const checkMessageWith = ({ message = {} }) => {
  const {
    maxLines,
    minLines,
    enforceEmptySecondLine,
    linesMustHaveLengthBetween
  } = message;

  return ({ commit: { message }, sha }) => {
    const shortSha = sha.slice(0, 7);

    const commitLines = message.split("\n");

    if (maxLines && commitLines.length > maxLines) {
      return `Commit message for ${shortSha} is too long.`;
    }
    if (minLines && commitLines.length < minLines) {
      return `Commit message for ${shortSha} is too short.`;
    }
    if (enforceEmptySecondLine && commitLines.length > 1 && commitLines[1].trim !== "") {
      return `Commit message for ${shortSha} must have empty second line.`;
    }
    if (linesMustHaveLengthBetween) {
      const [ minLineLen, maxLineLen ] = linesMustHaveLengthBetween;
      const hasExtraLongLine = some(commitLines.slice(1), line => line.length > maxLineLen);
      const hasTooShortLine = some(commitLines.slice(2), line => line.length < minLineLen);

      if (hasExtraLongLine) {
        return `Commit message lines much be shorter than ${maxLineLen} for ${shortSha}.`;
      }
      if (hasTooShortLine) {
        return `Commit message lines much be longer than ${minLineLen} for ${shortSha}.`;
      }
    }
  };
};

const checkMessages = (commitConfig, commitEntries) => chain(commitEntries)
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
