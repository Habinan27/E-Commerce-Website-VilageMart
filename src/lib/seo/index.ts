import type { Metadata } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SITE_NAME = 'Village Mart';
const DEFAULT_DESCRIPTION = 'Discover authentic Sri Lankan village products, pure bee honey, traditional rice, spices, and handcrafted goods directly from local village sellers.';

export function generateSeoMetadata({
  title,
  description,
  path = '',
  image,
  type = 'website',
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
}): Metadata {
  const metaTitle = `${title} | ${SITE_NAME}`;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const url = `${APP_URL}${path}`;
  const ogImage = image || `${APP_URL}/images/og-default.jpg`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [ogImage],
    },
  };
}

export function generateProductJsonLd(product: any) {
  const images = product.productImages?.map((img: any) => img.imageUrl) || [];
  const primaryImage = images[0] || `${APP_URL}/images/placeholder.jpg`;

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    image: images.length > 0 ? images : [primaryImage],
    sku: product.slug,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'LKR',
      price: Number(product.price).toFixed(2),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: product.seller?.shopName || 'Local Seller',
      },
    },
  };

  if (product.reviewCount && product.reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return jsonLd;
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${APP_URL}${item.url}`,
    })),
  };
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: APP_URL,
    logo: `${APP_URL}/images/logo.png`,
    description: DEFAULT_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'LK',
    },
  };
}
