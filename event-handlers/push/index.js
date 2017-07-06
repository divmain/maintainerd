const handlePush = require("./handler");


const extractPrData = payload => ({
  ref: payload.ref,
  head: payload.head,
  oldHead: payload.before,
  commits: payload.commits,
  repoPath: payload.repository.full_name
});


module.exports = async (payload, config, gh) => {
  await handlePush(extractPrData(payload), config, gh);
};
