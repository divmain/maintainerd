const vm = require("vm");

const { REGEXP_TIMEOUT } = require("../config");


const test = (re, value) => {
  return vm.runInNewContext(
    "re.test(value)",
    { re, value },
    { timeout: REGEXP_TIMEOUT }
  );
};


module.exports = { test };
