// 参考 https://zenn.dev/wakamsha/articles/learn-semantic-release

/** @type {import('semantic-release').GlobalConfig} */
const releaseConfig = {
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json", "package-lock.json"],
      },
    ],
    "@semantic-release/github",
  ],
};

export default releaseConfig;
