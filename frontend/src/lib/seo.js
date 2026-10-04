import { useEffect } from 'react';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Set page title, description, canonical, Open Graph / Twitter tags and any
 * JSON-LD blocks. Everything is cleaned up on unmount.
 */
export function useSeo({ title, description, canonical, image, jsonLd }) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', 'BUBBLO');
    if (image) upsertMeta('property', 'og:image', image);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    if (image) upsertMeta('name', 'twitter:image', image);

    const url = canonical ? `${SITE_URL}${canonical}` : SITE_URL;
    upsertLink('canonical', url);
    upsertMeta('property', 'og:url', url);

    const blocks = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
    blocks.forEach((block, i) => upsertJsonLd(`bubblo-jsonld-${i}`, block));

    return () => {
      document.title = prevTitle;
      blocks.forEach((_, i) => upsertJsonLd(`bubblo-jsonld-${i}`, null));
    };
  }, [title, description, canonical, image, JSON.stringify(jsonLd)]);
}

export function organizationJsonLd(settings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings?.brandName || 'BUBBLO',
    url: SITE_URL,
    slogan: settings?.tagline || 'Make Moments Magical.',
    contactPoint: settings?.contact?.phone
      ? [{ '@type': 'ContactPoint', telephone: settings.contact.phone, contactType: 'customer service', areaServed: 'IN' }]
      : undefined,
  };
}

export function productJsonLd(product) {
  if (!product) return null;
  const offer = {
    '@type': 'Offer',
    priceCurrency: 'INR',
    price: product.price,
    availability: product.visible ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    url: `${SITE_URL}/products/${product.slug}`,
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description,
    image: product.gallery?.map((g) => g.url).filter(Boolean) || [],
    sku: product.slug,
    brand: { '@type': 'Brand', name: 'BUBBLO' },
    offers: offer,
  };
}

export function faqJsonLd(faqs) {
  if (!faqs || !faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export { SITE_URL };
