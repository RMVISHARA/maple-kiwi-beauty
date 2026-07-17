import { getAllProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://maplekiwibeauty.lk";

  // Fetch all products from the MySQL database
  let products = [];
  try {
    products = await getAllProducts();
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  // Generate dynamic product URLs
  const productUrls = products.map((product) => {
    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    return {
      url: `${baseUrl}/products/${product.id}-${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    };
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...productUrls,
  ];
}
