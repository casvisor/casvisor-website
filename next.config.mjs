import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// Pages of the old Docusaurus site, so that links and search results keep working.
const oldDocs = {
  overview: 'getting-started/introduction',
  'basic/installation': 'getting-started/casdoor',
  'basic/try-with-docker': 'getting-started/quickstart',
  'asset/overview': 'assets/assets',
  'asset/rdp': 'assets/protocols',
  'asset/vnc': 'assets/protocols',
  'asset/database': 'more/roadmap',
  'asset/intranet': 'assets/assets',
  'command/command': 'more/roadmap',
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
  redirects: async () => redirects(),
};

export default withMDX(config);
