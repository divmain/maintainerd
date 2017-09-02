const { send } = require("micro");

const { GitHub } = require("../../github");
const { SEMVER_MARKER } = require("../../event-handlers/pull-request/checklist");

const semverRe = new RegExp(`^- \\[x\\] ${SEMVER_MARKER} (.*)`, "m");


exports.GET = async (req, res) => {
  const {
    installationId,
    repoPath,
    prNumber
  } = req.query || {};
  if (
    !installationId ||
    !repoPath ||
    !prNumber
  ) {
    return send(res, 403);
  }

  const gh = new GitHub(installationId);
  const payload = await gh.getPullRequest(repoPath, prNumber);

  const { body } = payload;
  if (!body) { return send(res, 404); }

  const match = body.match(semverRe);
  if (!match) { return send(res, 404); }

  return send(res, 200, match[1].trim());
};
