import { Product, Blog, Partner, SiteSettings } from '../types/ecommerce';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Handcrafted Heritage Block-Print Cotton Bedsheet',
    slug: 'handcrafted-heritage-block-print-cotton-bedsheet',
    sku: 'JS-HM-HD01',
    description: 'Masterfully woven 100% Organic Egyptian Cotton bedsheet featuring traditional Jaipur hand-block printed motifs. Crafted by master artisans with eco-friendly natural dyes. Ideal for luxury home bedrooms and boutique eco-resorts.',
    short_description: '300 TC Jaipur hand-block printed cotton double bedsheet with 2 matching pillow covers.',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80'
    ],
    production_type: 'Handmade',
    segment: 'Home',
    product_type: 'HOME DECOR',
    sales_availability: 'Both',
    retail_price: 2499,
    wholesale_price: 1599,
    stock_quantity: 45,
    min_wholesale_qty: 10,
    size: 'King Size (108 x 108 inches)',
    material: '100% Superfine Organic Cotton',
    color: 'Indigo Blue & Ivory',
    is_featured: true,
    is_new_arrival: true,
    is_active: true,
    created_at: '2026-01-15 10:00:00',
    updated_at: '2026-01-15 10:00:00'
  },
  {
    id: 2,
    name: 'Artisanal Macrame Boho Wall Hanging & Tapestry',
    slug: 'artisanal-macrame-boho-wall-hanging',
    sku: 'JS-HM-ART01',
    description: 'Intricately hand-knotted macrame wall hanging made with 100% natural unbleached cotton cord mounted on solid teak wood driftwood. Brings rustic warmth and artistic texture to modern living rooms or hotel lobbies.',
    short_description: 'Hand-knotted natural cotton fiber wall tapestry with teak wood hanging rod.',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1000&q=80'
    ],
    production_type: 'Handmade',
    segment: 'Home',
    product_type: 'ART DECOR',
    sales_availability: 'Both',
    retail_price: 1899,
    wholesale_price: 1199,
    stock_quantity: 30,
    min_wholesale_qty: 15,
    size: '36 x 24 inches',
    material: 'Natural Cotton Thread & Teak Wood',
    color: 'Natural Off-White',
    is_featured: true,
    is_new_arrival: false,
    is_active: true,
    created_at: '2026-01-16 11:30:00',
    updated_at: '2026-01-16 11:30:00'
  },
  {
    id: 3,
    name: 'Luxury Hotel Crisp White Satin Stripe Bedsheet',
    slug: 'luxury-hotel-crisp-white-satin-stripe-bedsheet',
    sku: 'JS-FC-HD02',
    description: 'Engineered for luxury 5-star hotel standards. High density 400 Thread Count combed percale cotton with elegant 1cm satin stripes. Stain-resistant, bleach-safe, and ultra-durable for high-frequency laundering.',
    short_description: '400 TC Commercial Grade Satin Stripe White Fitted & Flat Sheet set.',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80'
    ],
    production_type: 'Factory',
    segment: 'Hotel',
    product_type: 'HOME DECOR',
    sales_availability: 'Both',
    retail_price: 3299,
    wholesale_price: 1999,
    stock_quantity: 150,
    min_wholesale_qty: 25,
    size: 'Super King (110 x 112 inches)',
    material: '100% Combed Mercerized Cotton',
    color: 'Bright Pristine White',
    is_featured: true,
    is_new_arrival: true,
    is_active: true,
    created_at: '2026-01-18 09:15:00',
    updated_at: '2026-01-18 09:15:00'
  },
  {
    id: 4,
    name: 'Grand Event Velvet Golden Embroidered Runner & Table Art',
    slug: 'grand-event-velvet-golden-embroidered-runner',
    sku: 'JS-HM-ART02',
    description: 'Opulux rich royal blue velvet table runner adorned with hand-stitched zardozi gold thread borders. Designed specifically for high-end wedding receptions, banquets, and luxury gala events.',
    short_description: 'Royal velvet table runner with antique golden thread border work.',
    images: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1000&q=80'
    ],
    production_type: 'Handmade',
    segment: 'Event',
    product_type: 'ART DECOR',
    sales_availability: 'Wholesale',
    retail_price: 2999,
    wholesale_price: 1850,
    stock_quantity: 60,
    min_wholesale_qty: 10,
    size: '108 x 16 inches',
    material: 'Micro-Velvet & Zardozi Threadwork',
    color: 'Royal Navy & Gold',
    is_featured: true,
    is_new_arrival: true,
    is_active: true,
    created_at: '2026-01-20 14:00:00',
    updated_at: '2026-01-20 14:00:00'
  },
  {
    id: 5,
    name: 'Modern Geometric Metallic Brass Wall Sculpture',
    slug: 'modern-geometric-metallic-brass-wall-sculpture',
    sku: 'JS-FC-ART03',
    description: 'Precision factory crafted laser-cut brass metal wall panel with hand-brushed antique gold finish. A stunning statement piece for hotel lobbies, luxury residences, and corporate boardrooms.',
    short_description: 'Contemporary 3D brass metal wall accent sculpture with anti-rust coating.',
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80'
    ],
    production_type: 'Factory',
    segment: 'Home',
    product_type: 'ART DECOR',
    sales_availability: 'Both',
    retail_price: 4999,
    wholesale_price: 3200,
    stock_quantity: 20,
    min_wholesale_qty: 5,
    size: '48 x 28 inches',
    material: 'Electroplated Solid Brass',
    color: 'Brushed Gold & Bronze',
    is_featured: true,
    is_new_arrival: false,
    is_active: true,
    created_at: '2026-01-22 16:45:00',
    updated_at: '2026-01-22 16:45:00'
  },
  {
    id: 6,
    name: 'Handwoven Kantha Stitch Vintage Reversible Bedspread',
    slug: 'handwoven-kantha-stitch-vintage-reversible-bedspread',
    sku: 'JS-HM-HD03',
    description: 'Authentic Bengal Kantha hand-stitched quilt bedspread created from layered fine cotton. Features fine running hand stitches creating abstract floral story patterns across the entire bed cover.',
    short_description: 'Reversible twin-sided Kantha hand-embroidered bedspread with pillow shams.',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1000&q=80'
    ],
    production_type: 'Handmade',
    segment: 'Home',
    product_type: 'HOME DECOR',
    sales_availability: 'Both',
    retail_price: 3499,
    wholesale_price: 2200,
    stock_quantity: 25,
    min_wholesale_qty: 8,
    size: 'Queen (90 x 100 inches)',
    material: '100% Handloom Cotton',
    color: 'Multicolor Floral Pastel',
    is_featured: false,
    is_new_arrival: true,
    is_active: true,
    created_at: '2026-01-25 12:00:00',
    updated_at: '2026-01-25 12:00:00'
  },
  {
    id: 7,
    name: 'Resort Collection Wrinkle-Free Linen Blend Bedsheet',
    slug: 'resort-collection-wrinkle-free-linen-blend-bedsheet',
    sku: 'JS-FC-HD04',
    description: 'High-end hospitality linen blend engineered for luxury boutique resorts. Breathable, quick-drying, and supremely soft against skin with natural heat regulating properties.',
    short_description: 'Factory finished European flax linen-cotton blend luxury resort bedsheet set.',
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80'
    ],
    production_type: 'Factory',
    segment: 'Hotel',
    product_type: 'HOME DECOR',
    sales_availability: 'Wholesale',
    retail_price: 3999,
    wholesale_price: 2450,
    stock_quantity: 80,
    min_wholesale_qty: 20,
    size: 'King Size (108 x 108 inches)',
    material: '60% Linen / 40% Long-Staple Cotton',
    color: 'Sage Green',
    is_featured: false,
    is_new_arrival: true,
    is_active: true,
    created_at: '2026-01-28 08:30:00',
    updated_at: '2026-01-28 08:30:00'
  },
  {
    id: 8,
    name: 'Handcrafted Terracotta & Brass Floral Vase Set',
    slug: 'handcrafted-terracotta-brass-floral-vase-set',
    sku: 'JS-HM-ART04',
    description: 'Set of 3 hand-molded terracotta vases decorated with raw brass filigree rings. Fired in traditional woodkilns and finished with eco-friendly matte sealant. Suitable for dried botanicals and fresh blooms.',
    short_description: 'Trio of hand-turned clay and antique brass accent vases for dining and event setups.',
    images: [
      'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=1000&q=80'
    ],
    production_type: 'Handmade',
    segment: 'Event',
    product_type: 'ART DECOR',
    sales_availability: 'Both',
    retail_price: 2199,
    wholesale_price: 1399,
    stock_quantity: 40,
    min_wholesale_qty: 12,
    size: 'Heights: 12", 10", 8"',
    material: 'Baked Terracotta & Solid Brass',
    color: 'Earthy Rust & Warm Brass',
    is_featured: true,
    is_new_arrival: false,
    is_active: true,
    created_at: '2026-02-01 15:10:00',
    updated_at: '2026-02-01 15:10:00'
  },
  {
    id: 9,
    name: 'Luxury Velvet Gold Motif Cushion Covers (Set of 5)',
    slug: 'luxury-velvet-gold-motif-cushion-covers',
    sku: 'JS-HM-HD05',
    description: 'Plush velvet decorative cushion covers with gilded zari thread leaf embroidery and concealed zipper closure. Elevates sofas, armchairs, and luxury hotel bedding sets.',
    short_description: 'Set of 5 designer velvet embroidered sofa and bed cushion covers (16x16 inches).',
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1000&q=80'
    ],
    production_type: 'Handmade',
    segment: 'Home',
    product_type: 'HOME DECOR',
    sales_availability: 'Both',
    retail_price: 1999,
    wholesale_price: 1250,
    stock_quantity: 65,
    min_wholesale_qty: 10,
    size: '16 x 16 inches each',
    material: 'High-Density Velvet & Zari Stitching',
    color: 'Emerald Green & Antique Gold',
    is_featured: true,
    is_new_arrival: true,
    is_active: true,
    created_at: '2026-02-03 10:00:00',
    updated_at: '2026-02-03 10:00:00'
  },
  {
    id: 10,
    name: 'Royal Antique Brass Chandelier & Ambient Pendant Light',
    slug: 'royal-antique-brass-chandelier-ambient-pendant-light',
    sku: 'JS-FC-EL01',
    description: 'Exquisite 6-arm warm gilded chandelier crafted with electroplated solid brass and textured crystal glass diffusers. Includes dimmable warm white Edison filament LED bulbs. Creates a majestic golden glow for living rooms and banquets.',
    short_description: '6-Arm luxury antique gold chandelier with energy-efficient warm LED ambient illumination.',
    images: [
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80'
    ],
    production_type: 'Factory',
    segment: 'Home',
    product_type: 'ELECTRIC DECOR',
    sales_availability: 'Both',
    retail_price: 8999,
    wholesale_price: 5800,
    stock_quantity: 25,
    min_wholesale_qty: 4,
    size: 'Diameter: 28 inches, Height: 24 inches',
    material: 'Forged Brass & Frosted Crystal Glass',
    color: 'Warm Brushed Gold',
    is_featured: true,
    is_new_arrival: true,
    is_active: true,
    created_at: '2026-02-04 11:20:00',
    updated_at: '2026-02-04 11:20:00'
  },
  {
    id: 11,
    name: 'Golden Moroccan Mosaic LED Table Lamp & Lantern',
    slug: 'golden-moroccan-mosaic-led-table-lamp',
    sku: 'JS-HM-EL02',
    description: 'Handcrafted Turkish/Moroccan style bedside table lamp featuring hand-cut stained glass mosaics and antique brass base. Emits breathtaking kaleidoscopic warm patterns across your walls.',
    short_description: 'Handcrafted Moroccan glass mosaic decorative nightstand lamp with built-in warm LED.',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80'
    ],
    production_type: 'Handmade',
    segment: 'Home',
    product_type: 'ELECTRIC DECOR',
    sales_availability: 'Both',
    retail_price: 2799,
    wholesale_price: 1750,
    stock_quantity: 45,
    min_wholesale_qty: 8,
    size: 'Height: 14 inches, Diameter: 7 inches',
    material: 'Hand-Cut Glass & Antiqued Metal',
    color: 'Golden Amber & Bronze',
    is_featured: true,
    is_new_arrival: true,
    is_active: true,
    created_at: '2026-02-06 14:15:00',
    updated_at: '2026-02-06 14:15:00'
  },
  {
    id: 12,
    name: 'Modern Minimalist Warm Gold LED Arc Floor Lamp',
    slug: 'modern-minimalist-warm-gold-led-arc-floor-lamp',
    sku: 'JS-FC-EL03',
    description: 'Architectural sweeping arc standing lamp with brushed champagne gold finish and heavy marble base. Features 3-step touch dimming with glare-free 3000K warm ambient glow.',
    short_description: 'Contemporary curved standing floor lamp in brushed brass with step dimming.',
    images: [
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80'
    ],
    production_type: 'Factory',
    segment: 'Hotel',
    product_type: 'ELECTRIC DECOR',
    sales_availability: 'Both',
    retail_price: 6499,
    wholesale_price: 4200,
    stock_quantity: 30,
    min_wholesale_qty: 5,
    size: 'Height: 68 inches, Span: 36 inches',
    material: 'Heavy Iron, Brass Coating & Marble Base',
    color: 'Champagne Gold & Black Marble',
    is_featured: true,
    is_new_arrival: false,
    is_active: true,
    created_at: '2026-02-08 09:30:00',
    updated_at: '2026-02-08 09:30:00'
  },
  {
    id: 13,
    name: 'Royal Peacock 3D Metal Wall Art with Gold Patina Finish',
    slug: 'royal-peacock-3d-metal-wall-art',
    sku: 'JS-HM-ART05',
    description: 'Handcrafted large iron wall sculpture depicting a graceful royal peacock with spreading plumage in hand-tinted gold and turquoise patina. Sealed with protective clear gloss.',
    short_description: 'Grand 3D metal embossed peacock wall sculpture for living room and foyer highlights.',
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80'
    ],
    production_type: 'Handmade',
    segment: 'Home',
    product_type: 'ART DECOR',
    sales_availability: 'Both',
    retail_price: 5499,
    wholesale_price: 3600,
    stock_quantity: 18,
    min_wholesale_qty: 4,
    size: '42 x 30 inches',
    material: 'Forged Wrought Iron & Hand-applied Gold Leaf',
    color: 'Antique Gold & Emerald Turquoise',
    is_featured: true,
    is_new_arrival: true,
    is_active: true,
    created_at: '2026-02-10 16:00:00',
    updated_at: '2026-02-10 16:00:00'
  },
  {
    id: 14,
    name: 'Handcrafted Crystal & Gold Illuminated Wall Sconce',
    slug: 'handcrafted-crystal-gold-illuminated-wall-sconce',
    sku: 'JS-FC-EL04',
    description: 'Luxury hotel-grade decorative wall bracket light with precision cut crystal prism drops and polished gold metallic backplate. Water-resistant for covered patios and hotel hallways.',
    short_description: 'Dual-light crystal and gold wall sconce with soft upward and downward lighting beam.',
    images: [
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80'
    ],
    production_type: 'Factory',
    segment: 'Hotel',
    product_type: 'ELECTRIC DECOR',
    sales_availability: 'Wholesale',
    retail_price: 3899,
    wholesale_price: 2400,
    stock_quantity: 50,
    min_wholesale_qty: 10,
    size: 'Height: 18 inches, Width: 8 inches',
    material: 'K9 Optical Crystal & Electroplated Stainless Steel',
    color: 'Mirrored Gold & Clear Crystal',
    is_featured: false,
    is_new_arrival: true,
    is_active: true,
    created_at: '2026-02-12 12:45:00',
    updated_at: '2026-02-12 12:45:00'
  }
];

export const INITIAL_BLOGS: Blog[] = [
  {
    id: 1,
    title: 'The Evolution of Thread Count: What Hotels Look for in Commercial Bedsheets',
    slug: 'evolution-of-thread-count-hotel-bedsheets',
    featured_image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80',
    short_description: 'Demystifying Thread Count vs. Fiber Staple Length in luxury hospitality bedding. Learn why 300–400 TC combed cotton outperforms 1000 TC microfiber.',
    full_content: `In the luxury hospitality sector, bed linens are subjected to extreme wear, high-temperature industrial washing, and constant chemical sanitization. Many retail consumers believe that a higher thread count automatically equals better quality, but commercial hoteliers know better.

    **Staple Length vs. Thread Density**
    The secret to long-lasting hotel softness lies in long-staple and extra-long-staple (ELS) cotton fibers, such as Egyptian or Supima cotton. A true 300 to 400 Thread Count constructed with 100% single-ply combed long-staple yarns delivers superior breathability, resistance to pilling, and exceptional longevity compared to multi-ply 800+ TC sheets.

    **Mercerization & Satin Weave**
    JSArt&Decor utilizes mercerized cotton for our hotel collections. Mercerization increases fiber strength, enhances dye affinity, and imparts a lustrous silky shine that withstands over 200 industrial wash cycles.`,
    category: 'Textile Technology',
    author: 'JSArt&Decor Textile Research',
    status: 'Published',
    created_at: '2026-02-02 11:00:00'
  },
  {
    id: 2,
    title: 'Preserving Traditional Jaipur Hand-Block Printing in Modern Interior Decor',
    slug: 'preserving-jaipur-hand-block-printing-interior-decor',
    featured_image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
    short_description: 'How centuries-old woodblock carvings and natural organic vegetable dyes bring soulful artisanal luxury to contemporary minimal residential design.',
    full_content: `Hand-block printing is a heritage craft that has flourished in Rajasthan for centuries. Each wooden block is carved meticulously by hand out of teak wood before being dipped into non-toxic natural mineral and plant dyes.

    **Embracing Imperfect Beauty**
    Unlike factory screen-printing where every line is chemically identical, hand-block printing carries subtle variations in pressure and alignment. These soft, organic nuances give each bedsheet and tapestry its unique human soul.

    At JSArt&Decor, we collaborate directly with artisan clusters in Sanganer and Bagru, paying fair trade wages and promoting eco-conscious water recycling systems in crafting every handmade piece.`,
    category: 'Handmade Products',
    author: 'Chief Designer, JSArt&Decor',
    status: 'Published',
    created_at: '2026-02-05 14:20:00'
  },
  {
    id: 3,
    title: '5 Statement Art & Decor Trends Transforming Hotel Lobbies and Banquet Events',
    slug: '5-statement-art-decor-trends-hotel-lobbies-events',
    featured_image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=80',
    short_description: 'From 3D brass geometric wall installations to rich velvet zardozi accents, discover how event planners are creating unforgettable visual spaces.',
    full_content: `Modern event design is moving away from disposable plastic decorations toward sustainable, reusable artisanal statement pieces. 

    **1. Tactile Brass & Metal Sculptures**
    Lobbies and event backdrops are adopting geometric laser-cut brass frames that catch ambient lighting to create warmth and movement.

    **2. Deep Velvet & Zardozi Table Runners**
    Rich jewel tones—emerald green, royal navy, and deep burgundy velvet embroidered with antique gold wire—instantly elevate wedding banquet tables.

    **3. Handwoven Botanical Tapestries**
    Boho luxury weddings favor natural fiber macrame and terracotta vessels filled with dried pampas grass and local floral blooms.`,
    category: 'Industry Updates',
    author: 'Event Style Team',
    status: 'Published',
    created_at: '2026-02-08 09:45:00'
  }
];

export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 1,
    name: 'The Oberoi Grand Resorts & Spa',
    logo_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80',
    description: 'Bulk provider of 400 TC satin stripe bedsheets and luxury suite decor accessories.',
    website: 'https://example.com/oberoi',
    display_order: 1,
    is_active: true
  },
  {
    id: 2,
    name: 'Taj Palace Hospitality Group',
    logo_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80',
    description: 'Exclusive custom embroidered banquet linen and event table runner partner.',
    website: 'https://example.com/taj',
    display_order: 2,
    is_active: true
  },
  {
    id: 3,
    name: 'Royal Heritage Banquet & Events',
    logo_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=300&q=80',
    description: 'Wholesale client for seasonal hand-crafted brass art accents and velvet drapes.',
    website: 'https://example.com/royal-heritage',
    display_order: 3,
    is_active: true
  },
  {
    id: 4,
    name: 'Boutique Living Interiors',
    logo_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=300&q=80',
    description: 'Retail design partner carrying JSArt&Decor block-print cotton bedsheets.',
    website: 'https://example.com/boutique-living',
    display_order: 4,
    is_active: true
  }
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  store_name: 'JSArt&Decor',
  logo_path: '/uploads/logo.png', // Clear logo placeholder configuration
  contact_phone: '+91 98765 43210',
  whatsapp_number: '+91 98765 43210',
  contact_email: 'info@jsartdecor.com',
  address: 'JSArt&Decor Textile & Art Hub, Phase II Industrial Estate, Jaipur, Rajasthan 302022, India',
  razorpay_key_id: '',
  enable_cod: false,
  free_shipping_threshold: 2499,
  standard_shipping_fee: 150,
  imagekit_public_key: '',
  imagekit_url_endpoint: '',
  imagekit_private_key: ''
};

export const INITIAL_BANNERS: any[] = [
  {
    id: 1,
    title: 'Crafted Luxury Textiles & Artisan Decor',
    subtitle: 'PREMIUM QUALITY • TIMELESS ELEGANCE',
    highlight_text: 'Artisan Decor',
    description: 'Manufacturer, Wholesaler & Retailer of premium home textiles & handcrafted decor items direct from Jaipur.',
    image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80',
    link_url: 'catalog',
    button_text: 'EXPLORE COLLECTION',
    banner_type: 'hero',
    display_order: 1,
    is_active: true
  },
  {
    id: 2,
    title: 'Royal Linens & Hotel Quality Bedding Sets',
    subtitle: 'EXCLUSIVE WHOLESALE & RETAIL COLLECTION',
    highlight_text: 'Bedding Sets',
    description: 'Elevate your spaces with 100% fine cotton, handblock prints and designer quilts with factory direct pricing.',
    image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=80',
    link_url: 'catalog',
    button_text: 'SHOP BEDDING',
    banner_type: 'hero',
    display_order: 2,
    is_active: true
  },
  {
    id: 3,
    title: 'Heritage Indian Block Prints & Custom Decor',
    subtitle: 'HANDMADE BY SKILLED ARTISANS',
    highlight_text: 'Custom Decor',
    description: 'Direct factory pricing for bulk orders, hospitality partners and commercial interior decorators.',
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    link_url: 'wholesale-tree',
    button_text: 'WHOLESALE ENQUIRY',
    banner_type: 'hero',
    display_order: 3,
    is_active: true
  },
  {
    id: 4,
    title: 'Festive Bulk Orders - 40% Off Wholesale MOQ',
    subtitle: 'LIMITED TIME B2B DISPATCH',
    highlight_text: '40% Off Wholesale',
    description: 'Special seasonal allocation for retail chains, hotel suppliers, and boutique gift distributors.',
    image_url: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1200&q=80',
    link_url: 'wholesale-tree',
    button_text: 'CLAIM WHOLESALE PRICING',
    banner_type: 'promo',
    display_order: 1,
    is_active: true
  },
  {
    id: 5,
    title: 'Jaipur Handblock Masterpiece Series',
    subtitle: 'CURATED HERITAGE ARTISTRY',
    highlight_text: 'Blockprint Specials',
    description: 'Authentic Bagru & Sanganeri natural dyed fabrics crafted on heritage teak wood hand-press blocks.',
    image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    link_url: 'catalog',
    button_text: 'VIEW CURATED SERIES',
    banner_type: 'curated',
    display_order: 1,
    is_active: true
  }
];

export const INITIAL_SECTIONS: any[] = [
  {
    id: 1,
    page_name: 'home',
    section_key: 'home_hero',
    title: 'Crafted Luxury Textiles & Artisan Decor',
    subtitle: 'Handmade Jaipur Heritage & Factory Manufacturing',
    badge: 'JAIPUR HERITAGE CRAFT',
    content: 'Specializing in 100% fine cotton bedsheets, handblock prints, artisan decor, and electric lighting accents.',
    image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    button_text: 'Explore Catalog',
    button_url: 'catalog',
    is_active: true,
    display_order: 1
  },
  {
    id: 2,
    page_name: 'home',
    section_key: 'home_story',
    title: 'Generations of Handblock & Loom Mastery',
    subtitle: 'From Jaipur workshops directly to premium bedrooms and hotels',
    badge: 'OUR ARTISAN LEGACY',
    content: 'Founded on the rich textile traditions of Rajasthan, JSArt&Decor connects master artisans with contemporary interior aesthetics. We control every stage of production—from organic yarn spinning and wooden block carving to natural eco-dyeing and precision finishing.',
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    button_text: 'Our Manufacturing Journey',
    button_url: 'wholesale-tree',
    is_active: true,
    display_order: 2
  },
  {
    id: 3,
    page_name: 'wholesale-tree',
    section_key: 'wholesale_intro',
    title: 'B2B Wholesale & Factory Manufacturing',
    subtitle: 'Direct Jaipur Workshop Supply Chain for Retailers & Hoteliers',
    badge: 'TIERED WHOLESALE PRICING',
    content: 'Benefit from tiered wholesale pricing with low minimum order quantities (MOQ starting at 10 pieces). Custom branding, barcoding, and export packaging available.',
    image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
    button_text: 'Download Catalog',
    button_url: 'contact',
    is_active: true,
    display_order: 1
  },
  {
    id: 4,
    page_name: 'contact',
    section_key: 'contact_header',
    title: 'Reach Out To Our Jaipur Workshop',
    subtitle: 'Direct support for wholesale enquiries, bulk export orders, and custom client requests',
    badge: 'WE ARE HERE TO HELP',
    content: 'Our team is available Monday to Saturday (9:00 AM - 7:00 PM IST) for wholesale quotes, sample swatch books, and customer support.',
    image_url: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=1200&q=80',
    button_text: 'WhatsApp Us',
    button_url: 'whatsapp',
    is_active: true,
    display_order: 1
  }
];
