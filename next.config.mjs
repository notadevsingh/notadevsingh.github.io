/**
 * Two deploy targets, one config.
 *
 *   Vercel / Cloudflare  -> plain `next build`, server features stay available.
 *   GitHub Pages         -> DEPLOY_TARGET=pages, static export into ./out
 *
 * The GitHub Actions workflow sets DEPLOY_TARGET and BASE_PATH. Locally you get
 * a normal dev server with no basePath, so links behave the same either way.
 */
const isPages = process.env.DEPLOY_TARGET === 'pages';
const basePath = isPages ? process.env.BASE_PATH ?? '' : '';

/** @type {import('next').NextConfig} */
export default {
  ...(isPages
    ? {
        output: 'export',
        basePath,
        assetPrefix: basePath ? `${basePath}/` : undefined,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
