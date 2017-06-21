const fetch = require("node-fetch");

const { getIntegrationToken } = require("./integration-token");


const installationTokens = Object.create(null);
const getNow = () => (Date.now() / 1000) | 0;


const newInstallationToken = async installationId => {
  const integrationToken = getIntegrationToken();
  const response = await fetch(`https://api.github.com/installations/${installationId}/access_tokens`, {
    method: "POST",
    headers: {
      "Accept": "application/vnd.github.machine-man-preview+json",
      "Authorization": `Bearer ${integrationToken}`
    }
  });

  const json = await response.json();
  const { token } = json;
  if (!token) { throw new Error(json.message); }

  const time = getNow();
  installationTokens[installationId] = { time, token };
  return token;
};


module.exports.getInstallationToken = installationId => {
  const tokenEntry = installationTokens[installationId];
  if (!tokenEntry) {
    return newInstallationToken(installationId);
  }

  // Get a new token if the old one is older than 45 minutes.
  if (getNow() - tokenEntry.time > 2700) {
    return newInstallationToken(installationId);
  }

  return tokenEntry.token;
};
