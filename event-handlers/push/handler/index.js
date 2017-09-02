const tagHandler = require("./tag");
// const branchHandler = require("./branch");


module.exports = async (data, config, gh) => {
  const { ref } = data;

  const tagMatch = ref.match(/^refs\/tags\/(.+)/);
  if (tagMatch) {
    const [ , shortRef ] = tagMatch;
    return tagHandler(shortRef, data, config, gh);
  }

  const branchMatch = ref.match(/^refs\/heads\/(.+)/);
  if (branchMatch) {
    return tagHandler(branchMatch, data, config, gh);
  }

  return null;
};
