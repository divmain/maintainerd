const actionableEvents = {
  edited: require("./edited"),
  synchronize: require("./synchronize"),
  reopened: require("./opened"),
  opened: require("./opened")
};

module.exports = async (data, config, gh) => {
  const { action } = data;

  const actionHandler = actionableEvents[action];
  return actionHandler ?
    await actionHandler(data, config, gh) :
    null;
};
