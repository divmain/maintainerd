const { resolve } = require("path");

const { send } = require("micro");
const fsRouter = require("fs-router");


const getRoute = fsRouter(resolve(__dirname, "routes"));


module.exports = async (req, res) => {
  const route = getRoute(req);
  try {
    if (route) { return await route(req, res); }
  } catch (err) {
    console.error(err && err.stack || err);
    return send(res, 500, "Internal server error");
  }
  send(res, 404, "Not found.");
};
