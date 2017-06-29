const handlePullRequestAction = require("./handle-action");


const extractData = payload => ({});


module.exports = async (payload, config, gh) => {
  console.log(JSON.stringify(payload, null, 2));
  await handlePullRequestAction(extractData(payload), config, gh);
};
