const { GitHub } = require("../github");


const configMiddleware = handler => async payload => {
  const gh = new GitHub(payload.installation.id);
  const config = await gh.getConfig(payload.repository.full_name);
  return handler(payload, config, gh);
};


exports.eventHandlers = {
  pull_request: configMiddleware(require("./pull-request")),
  issues: configMiddleware(require("./issues")),
  push: configMiddleware(require("./push"))
};
