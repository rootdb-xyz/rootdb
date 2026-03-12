// All false by default in the open-source repo.
// Vercel production sets these via env vars.

export const features = {
  /** Show affiliate "Buy Rootable SKU" buttons */
  affiliateLinks: process.env.NEXT_PUBLIC_ENABLE_AFFILIATES === "true",

  /** Show admin panel link in nav for admins */
  adminPanel: !!process.env.ADMIN_GITHUB_IDS,

  /** Show a small "Support RootDB" banner on download pages */
  supportBanner: process.env.NEXT_PUBLIC_ENABLE_SUPPORT_BANNER === "true",

  /** Analytics script tag */
  analytics: !!process.env.NEXT_PUBLIC_ANALYTICS_ID,
};