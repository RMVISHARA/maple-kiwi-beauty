import { getProductById, toPublicProduct } from "@/lib/products";
import { notFound } from "next/navigation";
import ProductDetailView from "@/components/ProductDetailView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const idStr = resolvedParams.id.split("-")[0];
  const id = parseInt(idStr, 10);
  
  if (isNaN(id)) {
    return { title: "Product Not Found" };
  }

  const product = await getProductById(id);
  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.name} | ${product.brand} | Maple & Kiwi Beauty`,
    description: `${product.name} by ${product.brand}. ${product.subtitle}. Climate-compatible skincare imported from ${product.origin} directly to Sri Lanka.`,
    alternates: {
      canonical: `/products/${resolvedParams.id}`,
    },
    openGraph: {
      title: `${product.name} | ${product.brand}`,
      description: product.subtitle,
      url: `/products/${resolvedParams.id}`,
      siteName: "Maple & Kiwi Beauty",
      images: [
        {
          url: product.image,
          alt: product.name,
        },
      ],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }) {
  const resolvedParams = await params;
  const idStr = resolvedParams.id.split("-")[0];
  const id = parseInt(idStr, 10);

  if (isNaN(id)) {
    notFound();
  }

  const product = await getProductById(id);
  if (!product) {
    notFound();
  }

  // Schema.org Structured Data Snippets (JSON-LD)
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": `${process.env.NEXT_PUBLIC_APP_URL || "https://maplekiwibeauty.lk"}${product.image}`,
    "description": product.subtitle,
    "brand": {
      "@type": "Brand",
      "name": product.brand,
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_APP_URL || "https://maplekiwibeauty.lk"}/products/${resolvedParams.id}`,
      "priceCurrency": "LKR",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.inStock === false
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": process.env.NEXT_PUBLIC_APP_URL || "https://maplekiwibeauty.lk",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": `${process.env.NEXT_PUBLIC_APP_URL || "https://maplekiwibeauty.lk"}/#all-products`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `${process.env.NEXT_PUBLIC_APP_URL || "https://maplekiwibeauty.lk"}/products/${resolvedParams.id}`,
      },
    ],
  };

  return (
    <>
      {/* Schema.org Markups */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Main Page Content (expiry date stripped — customers never see it) */}
      <ProductDetailView product={toPublicProduct(product)} />
    </>
  );
}
