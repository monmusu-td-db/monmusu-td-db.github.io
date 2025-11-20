/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  output: "export",
  images: { unoptimized: true },
  sassOptions: {
    silenceDeprecations: [
      "mixed-decls",
      "color-functions",
      "global-builtin",
      "import",
    ],
  },
};

export default nextConfig;
