/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  output: "export",
  images: { unoptimized: true },
  sassOptions: {
    silenceDeprecations: ["import"],
  },
};

export default nextConfig;
