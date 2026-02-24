import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["lenis"],
  images: {
    domains: [],
  },
};

export default withPayload(nextConfig);
