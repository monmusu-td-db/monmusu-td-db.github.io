// 参考 https://zenn.dev/wakamsha/articles/learn-semantic-release

/** @type {import('semantic-release').GlobalConfig} */
const releaseConfig = {
  plugins: [
    "@semantic-release/commit-analyzer",
    [
      "@semantic-release/release-notes-generator",
      {
        presetConfig: {
          types: [
            { type: "feat", section: "機能追加" },
            { type: "fix", section: "バグ修正" },
            { type: "chore", hidden: true },
            { type: "docs", hidden: true },
            { type: "style", hidden: true },
            { type: "refactor", hidden: true },
            { type: "perf", hidden: true },
            { type: "test", hidden: true },
          ],
        },
      },
    ],
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
