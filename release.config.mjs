/** @type {import('semantic-release').GlobalConfig} */
const releaseConfig = {
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
  ],
};

export default releaseConfig;
