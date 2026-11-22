import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// Pages of the old Docusaurus site, so that links and search results keep working.
const oldDocs = {
  overview: 'getting-started/introduction',
  'basic/installation': 'getting-started/quickstart',
  'basic/try-with-docker': 'getting-started/quickstart',
  'asset/overview': 'assets/assets',
  'asset/rdp': 'assets/protocols',
  'asset/vnc': 'assets/protocols',
  'asset/database': 'assets/databases',
  'asset/intranet': 'assets/assets',
  command: 'audit/commands',
  'command/command': 'audit/commands',
};

function redirects() {
  const rules = [];
  for (const [from, to] of Object.entries(oldDocs)) {
    rules.push({ source: `/docs/${from}`, destination: `/en/docs/${to}`, permanent: true });
    rules.push({ source: `/zh/docs/${from}`, destination: `/zh/docs/${to}`, permanent: true });
    rules.push({ source: `/:lang(fr|de|ko|ru|ja)/docs/${from}`, destination: `/en/docs/${to}`, permanent: true });
  }
  rules.push({ source: '/:lang(fr|de|ko|ru|ja)', destination: '/en', permanent: true });
  rules.push({ source: '/:lang(fr|de|ko|ru|ja)/:path*', destination: '/en', permanent: true });
  for (const page of ['blog', 'help', 'users', 'pdf']) {
    rules.push({ source: `/${page}/:path*`, destination: '/en', permanent: true });
    rules.push({ source: `/zh/${page}/:path*`, destination: '/zh', permanent: true });
  }
  return rules;
}

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Vercel's image optimization is billed per image and fails with 402 when the quota runs out, so images are served as they are.
  images: { unoptimized: true },
  redirects: async () => redirects(),
};

export default withMDX(config);
