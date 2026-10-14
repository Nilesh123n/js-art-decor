// Category and Subcategory Hierarchy for JSArt&Decor
// Defines Segments: Home, Hotel, Event
// Under each Segment: Textile, Art Decor, Electric Decor
// With specialized subcategories for residential, hospitality, and event spaces

export type SegmentType = 'Home' | 'Hotel' | 'Event';
export type MainCategoryType = 'Textile' | 'Art Decor' | 'Electric Decor';

export const ALL_SEGMENTS: SegmentType[] = ['Home', 'Hotel', 'Event'];
export const ALL_MAIN_CATEGORIES: MainCategoryType[] = ['Textile', 'Art Decor', 'Electric Decor'];

export const CATEGORY_HIERARCHY: Record<SegmentType, Record<MainCategoryType, string[]>> = {
  Home: {
    Textile: [
      'Bed Sheets',
      'Quilts & Comforters',
      'Combo Packs',
      'Sofa Covers',
      'Curtains',
      'Puja Aasan (Prayer Mats)',
      'Carpets & Rugs',
      'Floor Mats',
      'Pillow Covers'
    ],
    'Art Decor': [
      'Statues & Sculptures',
      'Decorative Water Pots',
      'Wallpapers',
      'Wall Hangings',
      'Artificial Flowers & Floral Jhumar',
      'Torans & Door Hangings',
      'Wall Art & Pictures',
      'Decorative Mirrors'
    ],
    'Electric Decor': [
      'Wall Lamps',
      'String Lights (Series Lights)',
      'Elevation Lights',
      'LED Wall Pictures',
      'Illuminated Statues',
      'Chandeliers (Jhumar)',
      'Table Lamps',
      'LED Mirrors'
    ]
  },
  Hotel: {
    Textile: [
      'Pillow Covers',
      'Bed Sheets',
      'Quilts & Comforters',
      'Sofa Covers',
      'Curtains',
      'Puja Aasan (Prayer Mats)',
      'Carpets & Rugs',
      'Floor Mats',
      'Door Curtains'
    ],
    'Art Decor': [
      'Statues & Sculptures',
      'Decorative Water Pots',
      'Wallpapers',
      'Wall Hangings',
      'Artificial Flowers & Floral Jhumar',
      'Torans & Door Hangings',
      'Wall Art & Pictures',
      'Decorative Mirrors'
    ],
    'Electric Decor': [
      'Wall Lamps',
      'String Lights (Series Lights)',
      'Elevation Lights',
      'LED Wall Pictures',
      'Illuminated Statues',
      'Chandeliers (Jhumar)',
      'Table Lamps',
      'LED Mirrors'
    ]
  },
  Event: {
    Textile: [
      'Pillow Covers',
      'Bed Sheets',
      'Quilts & Comforters',
      'Sofa Covers',
      'Curtains',
      'Puja Aasan (Prayer Mats)',
      'Carpets & Rugs',
      'Floor Mats',
      'Door Curtains',
      'Table & Chair Covers',
      'Event Fabrics & Drapes'
    ],
    'Art Decor': [
      'Statues & Sculptures',
      'Decorative Water Pots',
      'Wallpapers',
      'Wall Hangings',
      'Artificial Flowers & Floral Jhumar',
      'Torans & Door Hangings',
      'Wall Art & Pictures',
      'Haldi & Mehndi Floral Decor',
      'Entrance Gate Decor',
      'Stage Decor',
      'Catering Decor',
      'Decorative Mirrors'
    ],
    'Electric Decor': [
      'LED String Lights',
      'Chandeliers (Jhumar)',
      'LED Wall Pictures',
      'Rope Lights',
      'Pole Lamps',
      'Entrance Gate Lights',
      'Halogen Lights',
      'Par Lights',
      'LED Mirrors'
    ]
  }
};

/**
 * Normalizes segment string to 'Home' | 'Hotel' | 'Event'
 */
export function normalizeSegment(seg?: string | null): SegmentType {
  if (!seg) return 'Home';
  const s = seg.toLowerCase().trim();
  if (s.includes('hotel')) return 'Hotel';
  if (s.includes('event')) return 'Event';
  return 'Home';
}

/**
 * Normalizes product_type or category string to 'Textile' | 'Art Decor' | 'Electric Decor'
 */
export function normalizeCategory(cat?: string | null): MainCategoryType {
  if (!cat) return 'Textile';
  const c = cat.toLowerCase().trim();
  if (c.includes('art')) return 'Art Decor';
  if (c.includes('electric') || c.includes('light') || c.includes('lamp') || c.includes('jhumar')) return 'Electric Decor';
  // Matches 'home decor', 'textile', 'bedsheet', etc.
  return 'Textile';
}

/**
 * Maps MainCategoryType to legacy product_type value used in databases
 */
export function toProductTypeDb(cat: MainCategoryType): 'HOME DECOR' | 'ART DECOR' | 'ELECTRIC DECOR' {
  switch (cat) {
    case 'Art Decor':
      return 'ART DECOR';
    case 'Electric Decor':
      return 'ELECTRIC DECOR';
    case 'Textile':
    default:
      return 'HOME DECOR';
  }
}

/**
 * Gets the subcategories list for a given segment and category
 */
export function getSubcategoriesFor(segment?: string | null, category?: string | null): string[] {
  const normSeg = normalizeSegment(segment);
  const normCat = normalizeCategory(category);
  return CATEGORY_HIERARCHY[normSeg]?.[normCat] || [];
}

/**
 * Returns all unique subcategories across all segments and categories
 */
export function getAllSubcategories(): string[] {
  const set = new Set<string>();
  ALL_SEGMENTS.forEach((seg) => {
    ALL_MAIN_CATEGORIES.forEach((cat) => {
      CATEGORY_HIERARCHY[seg][cat].forEach((sub) => set.add(sub));
    });
  });
  return Array.from(set);
}
