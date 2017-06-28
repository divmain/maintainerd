// const opened = require("./opened");
// const edited = require("./edited");
// const synchronize = require("./synchronize");


const actionableEvents = {
  // edited,
  // synchronize,
  // opened
};

exports.updateStatus = async opts => {
  // const {
  //   action,
  //   installationId,
  //   repoPath,
  //   sha
  // } = opts;

  const actionHandler = actionableEvents[action];

  return actionHandler ?
    await actionHandler(opts) :
    null;
};
