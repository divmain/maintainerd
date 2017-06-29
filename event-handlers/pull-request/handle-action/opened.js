const { build: buildChecklist } = require("../checklist");
const editedHandler = require("./edited");
const synchronizeHandler = require("./synchronize");


module.exports = async (pullRequestData, config, gh) => {
  await editedHandler(pullRequestData, config, gh);
  await synchronizeHandler(pullRequestData, config, gh);
};
