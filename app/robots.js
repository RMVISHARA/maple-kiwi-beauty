export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://maplekiwibeauty.lk";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin", // Prevent indexing of admin control panels
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
