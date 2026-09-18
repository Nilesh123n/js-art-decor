import { Product, Blog, SiteSettings } from '../types/ecommerce';

export const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://jsartanddecor.com';

/**
 * 1. Organization Schema (JSArt&Decor Brand & Corporate Identity)
 */
export function getOrganizationSchema(settings?: Partial<SiteSettings>) {
  const storeName = settings?.store_name || 'JSArt&Decor';
  const phone = settings?.contact_phone || '+91 86024 14046';
  const email = settings?.contact_email || 'info.jsartanddecor@gmail.com';
  const address = settings?.address || 'Phase II Industrial Estate, Jaipur, Rajasthan 302022, India';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: storeName,
    legalName: 'JSArt&Decor Handcrafted Textiles & Art Decor Private Limited',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/uploads/logo.png`,
      caption: storeName
    },
    description: 'Premier Indian textile manufacturer, wholesaler and retailer of Jaipur handblock print bedsheets, luxury home furnishing, art decor and hotel textiles.',
    telephone: phone,
    email: email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: 'Jaipur',
      addressRegion: 'Rajasthan',
      postalCode: '302022',
      addressCountry: 'IN'
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: phone,
        contactType: 'customer service',
        contactOption: 'TollFree',
        areaServed: ['IN', 'AE', 'US', 'GB'],
        availableLanguage: ['en', 'hi']
      },
      {
        '@type': 'ContactPoint',
        telephone: phone,
        contactType: 'sales',
        contactOption: 'HearingImpairedSupported',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi']
      }
    ],
    sameAs: [
      'https://www.instagram.com/jsartanddecor',
      'https://www.facebook.com/jsartanddecor',
      'https://api.whatsapp.com/send?phone=918602414046'
    ]
  };
}

/**
 * 2. WebSite Schema with Sitelinks Searchbox
 */
export function getWebSiteSchema(settings?: Partial<SiteSettings>) {
  const storeName = settings?.store_name || 'JSArt&Decor';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: storeName,
    description: 'Luxury handcrafted bedsheets, textiles and artistic home decor from Jaipur artisan clusters.',
    publisher: {
      '@id': `${SITE_URL}/#organization`
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    inLanguage: 'en-IN'
  };
}

/**
 * 3. LocalBusiness / HomeGoodsStore Schema
 */
export function getLocalBusinessSchema(settings?: Partial<SiteSettings>) {
  const storeName = settings?.store_name || 'JSArt&Decor';
  const phone = settings?.contact_phone || '+91 86024 14046';
  const email = settings?.contact_email || 'info.jsartanddecor@gmail.com';
  const address = settings?.address || 'Phase II Industrial Estate, Jaipur, Rajasthan 302022, India';

  return {
    '@context': 'https://schema.org',
    '@type': 'HomeGoodsStore',
    '@id': `${SITE_URL}/#store`,
    name: storeName,
    image: `${SITE_URL}/uploads/logo.png`,
    telephone: phone,
    email: email,
    url: SITE_URL,
    priceRange: '₹₹ - Affordable Luxury & Wholesale B2B',
    paymentAccepted: 'Cash, Credit Card, Debit Card, UPI, Net Banking, Razorpay',
    currenciesAccepted: 'INR',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:30',
        closes: '20:00'
      }
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: 'Jaipur',
      addressRegion: 'Rajasthan',
      postalCode: '302022',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 26.9124,
      longitude: 75.7873
    }
  };
}

/**
 * 4. Product Schema (Schema.org/Product)
 */
export function getProductSchema(product: Product, currentUrl?: string) {
  const pageUrl = currentUrl || `${SITE_URL}/?product=${product.id}`;
  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [`${SITE_URL}/uploads/logo.png`];
  
  const hasDiscount = !!product.discount_price && Number(product.discount_price) > 0 && Number(product.discount_price) < Number(product.retail_price);
  const activeRetailPrice = hasDiscount ? Number(product.discount_price) : Number(product.retail_price);
  const inStock = product.stock_quantity > 0;

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${pageUrl}#product`,
    name: product.name,
    image: images,
    description: product.description || product.short_description || `${product.name} - Handcrafted premium textile from JSArt&Decor Jaipur.`,
    sku: product.sku || `JSA-${product.id}`,
    mpn: product.sku || `JSA-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'JSArt&Decor'
    },
    category: product.product_type || 'HOME DECOR',
    material: product.material || '100% Pure Cotton',
    size: product.size || 'Standard Size',
    offers: [
      // Retail Offer
      {
        '@type': 'Offer',
        '@id': `${pageUrl}#retail-offer`,
        name: 'Retail Direct Purchase',
        url: pageUrl,
        priceCurrency: 'INR',
        price: activeRetailPrice,
        priceValidUntil: '2027-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'JSArt&Decor'
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: activeRetailPrice >= 2499 ? 0 : 150,
            currency: 'INR'
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'IN'
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 2,
              unitCode: 'DAY'
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 3,
              maxValue: 6,
              unitCode: 'DAY'
            }
          }
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'IN',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 7,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn'
        }
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '48',
      bestRating: '5',
      worstRating: '1'
    }
  };

  // If Wholesale pricing available, add Wholesale B2B Offer
  if (product.wholesale_price && product.wholesale_price > 0) {
    (schema.offers as any[]).push({
      '@type': 'Offer',
      '@id': `${pageUrl}#wholesale-offer`,
      name: `Wholesale B2B Bulk Tier (MOQ ${product.min_wholesale_qty} pcs)`,
      url: pageUrl,
      priceCurrency: 'INR',
      price: product.wholesale_price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      eligibleQuantity: {
        '@type': 'QuantitativeValue',
        minValue: product.min_wholesale_qty || 10,
        unitCode: 'C62' // Unit/Piece
      },
      seller: {
        '@type': 'Organization',
        name: 'JSArt&Decor'
      }
    });
  }

  return schema;
}

/**
 * 5. BlogPosting Schema (Schema.org/BlogPosting for individual blog articles)
 */
export function getBlogPostingSchema(blog: Blog, currentUrl?: string) {
  const pageUrl = currentUrl || `${SITE_URL}/?blog=${blog.id}`;
  
  // Clean plain text representation of content for search bots
  const plainTextContent = (blog.full_content || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*_`]/g, '')
    .trim()
    .slice(0, 5000);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${pageUrl}#article`,
    headline: blog.title,
    alternativeHeadline: blog.short_description,
    image: blog.featured_image ? [blog.featured_image] : [`${SITE_URL}/uploads/logo.png`],
    datePublished: blog.created_at || '2025-01-01T00:00:00Z',
    dateModified: blog.created_at || '2025-01-01T00:00:00Z',
    author: {
      '@type': 'Person',
      name: blog.author || 'JSArt&Decor Editorial'
    },
    publisher: {
      '@type': 'Organization',
      name: 'JSArt&Decor',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/uploads/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl
    },
    description: blog.short_description || blog.title,
    articleBody: plainTextContent,
    articleSection: blog.category || 'Textile & Home Decor',
    keywords: `${blog.category}, Jaipur Bed Sheets, Pure Cotton, Handblock Print, Home Furnishing, Textile Wholesale, JSArt&Decor`,
    inLanguage: 'en-IN'
  };
}

/**
 * 6. Blog Collection Schema (Schema.org/Blog for blog list page)
 */
export function getBlogListSchema(blogs: Blog[], currentUrl?: string) {
  const pageUrl = currentUrl || `${SITE_URL}/?view=blogs`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${pageUrl}#blog`,
    name: 'JSArt&Decor Textile Knowledge & Decor Insights',
    url: pageUrl,
    description: 'Expert articles on Jaipur handblock prints, thread counts, luxury bedsheets preservation, and hotel decor trends.',
    publisher: {
      '@type': 'Organization',
      name: 'JSArt&Decor',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/uploads/logo.png`
      }
    },
    blogPost: blogs.slice(0, 15).map(b => ({
      '@type': 'BlogPosting',
      headline: b.title,
      description: b.short_description,
      image: b.featured_image,
      url: `${SITE_URL}/?blog=${b.id}`,
      datePublished: b.created_at,
      author: {
        '@type': 'Person',
        name: b.author || 'JSArt&Decor Editorial'
      }
    }))
  };
}

/**
 * 7. ItemList Schema (For Catalog, Collection, and Home Showcase)
 */
export function getItemListSchema(products: Product[], listName: string, listUrl?: string) {
  const pageUrl = listUrl || SITE_URL;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${pageUrl}#itemlist`,
    name: listName,
    url: pageUrl,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((product, idx) => {
      const pUrl = `${SITE_URL}/?product=${product.id}`;
      const hasDiscount = !!product.discount_price && Number(product.discount_price) > 0 && Number(product.discount_price) < Number(product.retail_price);
      const price = hasDiscount ? Number(product.discount_price) : Number(product.retail_price);

      return {
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          image: product.images?.[0] || `${SITE_URL}/uploads/logo.png`,
          url: pUrl,
          sku: product.sku,
          description: product.short_description || product.name,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: price,
            availability: product.stock_quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
          }
        }
      };
    })
  };
}

/**
 * 8. BreadcrumbList Schema (Hierarchy navigation for Search Engines)
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`
    }))
  };
}

/**
 * 9. FAQPage Schema (For Home & Customer Questions)
 */
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * 10. Default Store FAQs for JSArt&Decor
 */
export const DEFAULT_STORE_FAQS = [
  {
    question: 'Are JSArt&Decor bedsheets made from 100% authentic pure cotton?',
    answer: 'Yes, all our luxury and daily-use bedsheets are crafted from 100% certified combed cotton, featuring skin-friendly azo-free dyes and traditional Jaipur artisanal block printing techniques.'
  },
  {
    question: 'What is the Minimum Order Quantity (MOQ) for B2B Wholesale buyers?',
    answer: 'For verified wholesale buyers and hospitality chains, our MOQ starts from 10 pieces per SKU with volume-tiered manufacturing discounts directly from our Jaipur looms.'
  },
  {
    question: 'Do you offer custom designs and private labeling for hotels and export brands?',
    answer: 'Yes, our in-house design studio and factory support custom textile weaving, specialized GSM specifications, embroidered logos, and bespoke block print development.'
  },
  {
    question: 'What are the delivery timelines across India and internationally?',
    answer: 'Standard domestic retail orders are dispatched within 24-48 hours and delivered within 3-6 business days with live SMS and AWB tracking. Bulk freight timelines vary by volume.'
  },
  {
    question: 'Is COD (Cash on Delivery) available?',
    answer: 'We provide 100% secure online prepaid payments via Razorpay (UPI, Credit/Debit Cards, Net Banking) to offer complimentary insurance and express shipping privileges.'
  }
];
