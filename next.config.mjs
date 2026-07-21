import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  async redirects() {
    /* الموقع التسويقي أصبح على الجذر — الروابط القديمة /site تبقى صالحة */
    return [{ source: "/site", destination: "/", permanent: true }];
  },
};

export default nextConfig;
