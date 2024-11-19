/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/", // 根路径
        destination: "/dashboard", // 目标路径
        permanent: true, // true 表示使用永久重定向 (HTTP 301)，否则为临时重定向 (HTTP 302)
      },
    ];
  },
};

export default nextConfig;
