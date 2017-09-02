const assert = require("assert");
const rewire = require("rewire");

let synchronize = rewire("../event-handlers/pull-request/handle-action/synchronize");
const checkMessageWith = synchronize.__get__('checkMessageWith');

const commitEntries = {
	emptyMessage: { commit: { message: '' }, sha: "foo" },
	multiLineMessage1: { commit: { message: 'foo\n\nbar\nline' }, sha: "foo" },
	multiLineMessage2: { commit: { message: 'foo\r\n\r\nbar\nbaz' }, sha: "foo" },
};


describe("checkMessageWith#no-config", () => {
	it("Should return falsy value with empty configuration", () => {
		Object.values(commitEntries).map((commitEntry) => {
			assert(!checkMessageWith({})(commitEntry));
		});
	});
});
