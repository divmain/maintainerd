const { createHmac } = require("crypto");
const { json, buffer, send } = require("micro");

const { eventHandlers } = require("../../event-handlers");
const { TOKEN } = require("../../config");


const isValid = async (req, providedSignature) => {
  const hmac = createHmac("sha1", TOKEN);
  hmac.update(await buffer(req), "utf-8");
  const calculatedSignature = `sha1=${hmac.digest("hex")}`;
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

  const payload = await json(req);
  const handlerDidRespond = await handler(payload, req, res);
  if (!handlerDidRespond) { return send(res, 200); }
};
