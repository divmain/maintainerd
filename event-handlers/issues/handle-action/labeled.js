module.exports = async (data, config, gh) => {
  const { repoPath, actionTarget, issue } = data;

  const onLabelAdded = config.issue && config.issue.onLabelAdded;
  if (!onLabelAdded) { return; }

  // onLabelAdded should be an object with keys corresponding to the label names
  // for which actions will be taken.
  const triggeredAction = onLabelAdded[actionTarget];
  if (!triggeredAction) { return; }

  if (triggeredAction.action === "comment") {
    gh.postComment(repoPath, issue.number, triggeredAction.data);
  }
};
