const SEPARATOR = "<!-- maintainerd: DO NOT REMOVE -->";
const ENTRY_MARKER = "<!-- checklist item -->"
const ENTRY_MARKER_REQUIRED = "<!-- checklist item; required -->";
const SEMVER_MARKER = "<!-- semver -->";


exports.build = (body, config) => {
  const { pullRequest: { preamble, items, semver } } = config;

  const checklistEntries = items.map(item =>
    `- [${
      item.default ? "x" : " "
    }] ${
      item.required ? ENTRY_MARKER_REQUIRED : ENTRY_MARKER
    }${
      item.prompt
    }${
      item.required ? " _(required)_" : ""
    }`
  );

  let semverMessage = "";
  // TODO: If `semver.autodetect` is `true`, auto-fill the selection based on commit
  // message prefix of Fix/Bug, Add/Feature, Change/Breaking, Documentation.
  if (semver.enabled) {
    semverMessage = `
The maintainers of this repository require you to select the semantic version type that
the changes in this pull request represent.  Please select one of the following:
- [ ] ${SEMVER_MARKER} major
- [ ] ${SEMVER_MARKER} minor
- [ ] ${SEMVER_MARKER} patch
- [ ] ${SEMVER_MARKER} documentation only
`
  }

  return `${body.split(SEPARATOR)[0].trim()}
${SEPARATOR}

-----

${preamble}
${checklistEntries.join("\n")}
${semverMessage}
`;
};
