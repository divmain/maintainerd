const { createHmac } = require("crypto");
const { json, buffer, send } = require("micro");

const { updateStatus } = require("../../status");
const { TOKEN } = require("../../config");


const last = arr => arr[arr.length - 1];


const extractPRMetadata = payload => ({
  action: payload.action,
  installationId: payload.installation.id,
  repoPath: payload.repository.full_name,
  sha: payload.pull_request.head.sha,

  title: payload.pull_request.title,
  userId: payload.sender.user.login,

  body: payload.pull_request.body,
  changes: payload.pull_request.changes
});


const eventHandlers = {
  pull_request: async (req, res) => {
    await updateStatus(extractPRMetadata(await json(req)));
    return send(res, 200);
  }
};


const isValid = async (req, providedSignature) => {
  const hmac = createHmac("sha1", TOKEN);
  hmac.update(await buffer(req), "utf-8");
  const calculatedSignature = `sha1=${hmac.digest("hex")}`
  return providedSignature === calculatedSignature;
};

module.exports.POST = async (req, res) => {
  const { headers } = req;

  const handler = eventHandlers[headers["x-github-event"]];
  if (!handler) { return send(res, 200); }

  const signature = headers["x-hub-signature"];
  if (!signature || !(await isValid(req, signature))) {
    console.error(`403: Unauthorized API request from ${req.connection.remoteAddress}`);
    return send(res, 403, "Not Authorized");
  }

  return handler(req, res);
};
