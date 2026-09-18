import React, { useEffect } from 'react';
import { SITE_URL } from '../../utils/seo';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  schemas?: Record<string, any>[];
  breadcrumbs?: { name: string; url: string }[];
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  schemas = []
}) => {
  useEffect(() => {
    // 1. Update Title
    const siteName = 'JSArt&Decor';
    const fullTitle = title 
      ? (title.includes(siteName) ? title : `${title} | ${siteName}`) 
      : 'JSArt&Decor - Luxury Textiles, Bedsheets & Handcrafted Art Decor';
    document.title = fullTitle;

    // Helper to update or create meta tags
    const updateMeta = (selector: string, attrName: string, attrValue: string, content: string) => {
      let meta = document.querySelector(selector) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Helper to update or create link tags
    const updateLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    const finalDesc = description || 'Manufacturer, Wholesaler & Retailer of luxury handcrafted bedsheets, Jaipur block prints, and premium home textiles.';
    const finalImage = image || `${SITE_URL}/uploads/logo.png`;
    const finalUrl = url || (typeof window !== 'undefined' ? window.location.href : SITE_URL);

    // 2. Meta Description
    updateMeta('meta[name="description"]', 'name', 'description', finalDesc);

    // 3. OpenGraph Tags
    updateMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    updateMeta('meta[property="og:description"]', 'property', 'og:description', finalDesc);
    updateMeta('meta[property="og:image"]', 'property', 'og:image', finalImage);
    updateMeta('meta[property="og:url"]', 'property', 'og:url', finalUrl);
    updateMeta('meta[property="og:type"]', 'property', 'og:type', type);
    updateMeta('meta[property="og:site_name"]', 'property', 'og:site_name', siteName);

    // 4. Twitter Card Tags
    updateMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    updateMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    updateMeta('meta[name="twitter:description"]', 'name', 'twitter:description', finalDesc);
    updateMeta('meta[name="twitter:image"]', 'name', 'twitter:image', finalImage);

    // 5. Canonical Link
    updateLink('canonical', finalUrl);

    // 6. Dynamic Schema.org JSON-LD Script Tag
    const scriptId = 'dynamic-seo-schema-script';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    
    if (schemas && schemas.length > 0) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }

      // If single schema, wrap in object; if multiple, wrap in @graph
      const structuredData = schemas.length === 1 
        ? schemas[0] 
        : {
            '@context': 'https://schema.org',
            '@graph': schemas
          };

      scriptTag.textContent = JSON.stringify(structuredData, null, 2);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    // Cleanup when component unmounts or view changes
    return () => {
      // Keep title and meta tags clean
    };
  }, [title, description, image, url, type, JSON.stringify(schemas)]);

  return null; // Head-only component
};
