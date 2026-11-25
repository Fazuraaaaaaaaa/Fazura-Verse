import { useEffect } from 'react';

export interface PageMetaOptions {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'video.movie' | 'video.episode' | 'music.song';
  jsonLd?: Record<string, unknown>;
}

const DEFAULT_DESCRIPTION =
  'FazuraStream - Digital Entertainment Super-Hub untuk nonton anime sub Indo, donghua, movie, baca manga/manhwa/manhua, dan streaming musik online.';
const SITE_ORIGIN = 'https://fazurastream.web.id';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/favicon.svg`;

function upsertMeta(attrName: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attrName}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export function usePageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  jsonLd,
}: PageMetaOptions) {
  useEffect(() => {
    const fullTitle = title.includes('FazuraStream') ? title : `${title} | FazuraStream`;
    const canonicalUrl =
      url ||
      (typeof window !== 'undefined'
        ? `${SITE_ORIGIN}${window.location.pathname}${window.location.search}`
        : SITE_ORIGIN);

    document.title = fullTitle;

    upsertMeta('name', 'title', fullTitle);
    upsertMeta('name', 'description', description);
    upsertCanonical(canonicalUrl);

    // OpenGraph
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:image', image || DEFAULT_IMAGE);
    upsertMeta('property', 'og:url', canonicalUrl);

    // Twitter
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image || DEFAULT_IMAGE);
    upsertMeta('name', 'twitter:url', canonicalUrl);

    // Structured Data (JSON-LD)
    const ldId = 'fazura-dynamic-jsonld';
    let scriptEl = document.getElementById(ldId) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = ldId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        ...jsonLd,
      });
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [title, description, image, url, type, jsonLd]);
}
