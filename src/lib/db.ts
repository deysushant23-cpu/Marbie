import fs from "fs";
import path from "path";

const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "db.json");

export interface Product {
  id: number;
  name: string;
  category: "necklaces" | "bracelets" | "bridal";
  subcategory: string;
  price: number;
  image: string;
  badge?: string;
  isExclusive?: boolean;
  sku: string;
  stock: number;
  description: string;
  dimensions: string;
  weight: string;
  images?: string[];
  colors?: { name: string; hex: string }[];
  originalPrice?: number;
}

export interface OrderItem {
  id: string;
  customerName: string;
  initials: string;
  avatarClass: string;
  date: string;
  amount: number;
  status: "PROCESSING" | "PACKED" | "READY_TO_DISPATCH" | "SHIPPED" | "DELIVERED" | "REFUNDED";
  trackingLink?: string;
  trackingPartner?: string;
  refundRequested?: boolean;
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  awbCode?: string;
  items?: { id: number; name: string; price: number; image: string; quantity: number }[];
  shippingAddress?: any;
}

export interface CustomerRecord {
  id: number;
  name: string;
  email: string;
  joinDate: string;
  totalOrders: number;
  lifetimeSpend: number;
  tier: "VIP EMERALD" | "GOLD TIER" | "COLLECTOR";
  image: string;
}

export interface ReviewItem {
  id: number;
  title: string;
  author: string;
  time: string;
  rating: number;
  content: string;
  criticism?: string;
  product: string;
  verified: boolean;
  flagged?: boolean;
  isFeatured?: boolean;
  image: string;
}

export interface SiteConfig {
  marketing?: {
    hero?: {
      title: string;
      subtitle: string;
      description: string;
    };
    promise?: {
      title: string;
      label: string;
      image: string;
      items: { title: string; desc: string; icon: string }[];
    };
    marqueeText?: string;
    marqueeLink?: string;
    marqueeBgColor?: string;
    marqueeTextColor?: string;
    offersTitle?: string;
    offers?: any[];
    lookbookStyle?: string;
    instagramStyle?: string;
    instagram?: any[];
    uspCards?: { title: string; desc: string; icon: string }[];
    trousseauTitle?: string;
    trousseauSubtitle?: string;
    trousseau?: any[];
  };
  labels?: {
    categorySection?: { title: string };
    arrivalsSection?: { title: string; subtitle: string; viewAllText: string; viewAllLink: string };
    bestSellersSection?: { title: string; subtitle: string };
    exclusiveStealsSection?: { title: string; subtitle: string };
    reviewsSection?: { title: string };
    instagramSection?: { handle: string; shopNowText: string };
    heroButtons?: { primary: string; primaryLink: string; secondary: string; secondaryLink: string };
    auth?: any;
  };
  heroCarouselRatio?: string;
  featuredProductIds?: string[];
  productCategories?: string[];
  categories?: { name: string; slug: string; image: string; allowedColors?: string[] }[];
  materials?: string[];
  colors?: { name: string; hex: string }[];
  navigation?: {
    main: { name: string; href: string }[];
    support: { name: string; href: string }[];
    company: { name: string; href: string }[];
    social: { icon: string; href: string }[];
  };
  footer?: {
    brandName: string;
    description: string;
    copyright: string;
  };
  carousel?: any[];
}

export interface DbSchema {
  products: Product[];
  orders: OrderItem[];
  customers: CustomerRecord[];
  reviews: ReviewItem[];
  config: SiteConfig;
  carousel?: any[];
  subscribers?: { id: string; email: string; date: string; status?: string }[];
  campaigns?: { id: string; subject: string; banner: string; title: string; body: string; ctaText: string; ctaLink: string; date: string; recipients: number }[];
}

const DEFAULT_CONFIG: SiteConfig = {
  heroCarouselRatio: "default",
  featuredProductIds: ["", "", "", ""],
  productCategories: ["Necklaces", "Earrings", "Rings", "Bangles", "Bridal"],
  labels: {
    categorySection: { title: "SHOP BY CATEGORY" },
    arrivalsSection: { title: "Hot New Arrivals", subtitle: "Hand-selected pieces from our latest royal curation.", viewAllText: "VIEW ALL ARRIVALS", viewAllLink: "/necklaces" },
    bestSellersSection: { title: "Best Selling Suites", subtitle: "Our most coveted pieces loved by over 50,000+ brides." },
    exclusiveStealsSection: { title: "Exclusive Bridal Steals", subtitle: "Statement Kundan & Polki sets crafted for royalty." },
    reviewsSection: { title: "REAL ROYAL BRIDES" },
    instagramSection: { handle: "@MARBIE_JEWELRY", shopNowText: "Shop Now" },
    heroButtons: { primary: "Shop the Collection", primaryLink: "/necklaces", secondary: "VIEW LOOKBOOK", secondaryLink: "/lookbook" }
  },
  marketing: {
    marqueeText: "✧ OVER 50,000+ ROYAL BRIDES STYLED GLOBALLY • TRUSTED BY TOP CELEBRITY STYLISTS • 100% ROYAL INDIAN CRAFTSMANSHIP • LIFETIME GOLD PLATING GUARANTEE • EXPRESS FREE INSURED SHIPPING ✧ OVER 50,000+ ROYAL BRIDES STYLED GLOBALLY • TRUSTED BY TOP CELEBRITY STYLISTS • 100% ROYAL INDIAN CRAFTSMANSHIP • LIFETIME GOLD PLATING GUARANTEE ✧",
    lookbookStyle: "carousel",
    instagramStyle: "square",
    offersTitle: "OFFERS",
    offers: [
      {
        id: "offer-1",
        title: "Summer Bridal Steals",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCiszRq5LNv5_06qoHu5y0glWLWVdZFWWnWug4_HzcsHjoNfQiGjnoIRv2HQRRXCRJxfJobyX7XVZ6u__BigftYGOz27MY2TV6pOX3hlObr4wgmqEQoC7ornVSjWZUqsI22odDzbZ6dtUW3q490DzPW9J17JV7Imao5L1RYU9y95U0JhVZCc9IEE3Z269ViUUNDWxJXSG_s-4BkljJQZjgma1iziyNTp83HvT6naXjn5oFPxTbVmmjnCNXLdTJn6_8sM25V_sV661g",
        link: "/necklaces"
      },
      {
        id: "offer-2",
        title: "Royal Kundan Suites",
        image: "/images/lookbook_hero.png",
        link: "/bracelets"
      }
    ],
    uspCards: [
      { title: "FREE EXPRESS SHIPPING", desc: "On all insured orders across India & Globe.", icon: "local_shipping" },
      { title: "LIFETIME PLATING WARRANTY", desc: "100% Gilded Gold & Kundan Craftsmanship.", icon: "verified_user" },
      { title: "100% SECURE CHECKOUT", desc: "Encrypted Online Payments & COD Available.", icon: "lock" },
      { title: "EASY CONCIERGE RETURNS", desc: "Hassle-free exchanges and bridal support.", icon: "published_with_changes" }
    ],
    hero: {
      title: "Timeless Elegance,\nCrafted for You",
      subtitle: "LUXURY REDEFINED",
      description: "Discover our exquisite collection of handcrafted heritage pieces. Sophistication begins at ₹500."
    },
    promise: {
      title: "The Marbie Promise",
      label: "OUR HERITAGE",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDES4KjVItB3W5oVaAx-a9UonP_vkq6TA0L0ObgAAlmfX5ZDbToeo-CPlvMr04qWL3G4bikHNJ_HtIQiGdNUovfXiNmxyqFIQ8UjfdfilWObeepuIfO3ck80Q_ibAxWjpItbXJYJKairNJyp7dOuIK0TZK08iiiL2sahteIgqhhXp40xwvTV7HBs_CJKJ611ZAkCGZ3qQSr2CmrWrMAEI1bgAG8PD0wi9AcahiLS2BitosJNdWzMYmw8xvr-YJ8lMWmmY04YpXY03j1",
      items: [
        { title: "Uncompromising Purity", desc: "Every piece is hallmarked and certified for purity. We use only the finest 18k and 22k gold, ethically sourced and meticulously tested.", icon: "verified" },
        { title: "Artisan Craftsmanship", desc: "Our master craftsmen spend hundreds of hours on a single design, preserving traditional techniques while embracing modern precision.", icon: "brush" },
        { title: "Ethical Sourcing", desc: "We are committed to conflict-free gemstones and responsible mining practices, ensuring our luxury never costs the earth.", icon: "eco" }
      ]
    },
    trousseauTitle: "THE ROYAL BRIDAL TROUSSEAU",
    trousseauSubtitle: "INTERACTIVE CURATION",
    trousseau: [
      {
        id: "haldi",
        title: "Haldi & Mehndi",
        subtitle: "VIBRANT & SUN-KISSED",
        desc: "Lightweight Polki and pastel enamel jewelry designed to dance with turmeric yellows and henna greens.",
        image: "/images/zoom_of_Beautiful_Indian_woman_202606232030 (1).jpeg",
        highlight: "18K Gilded Polki Drops",
        price: "₹4,500",
        link: "/earrings"
      },
      {
        id: "sangeet",
        title: "Sangeet Gala",
        subtitle: "GLIMMER & MOVEMENT",
        desc: "Statement diamond chokers and sparkling chandelier earrings crafted to catch the spotlight as you dance the night away.",
        image: "/images/WhatsApp Image 2026-06-23 at 23.11.23.jpeg",
        highlight: "Starlight Chandelier Suite",
        price: "₹12,500",
        link: "/necklaces"
      },
      {
        id: "wedding",
        title: "The Royal Wedding",
        subtitle: "HERITAGE KUNDAN SUITES",
        desc: "Majestic 22K gold-plated Kundan chokers, Mathapatti, and layered Rani Haars inspired by Rajasthani royal palaces.",
        image: "/images/Beautiful_Indian_woman_with_soft_202606232200.jpeg",
        highlight: "Maharani Kundan Haar",
        price: "₹28,000",
        link: "/bridal"
      },
      {
        id: "reception",
        title: "Reception Soirée",
        subtitle: "CONTEMPORARY SOPHISTICATION",
        desc: "Sleek platinum finishes, emerald focal stones, and modern tennis bracelets for a red-carpet finish.",
        image: "/images/WhatsApp Image 2026-06-25 at 15.32.38.jpeg",
        highlight: "Imperial Emerald Cuff",
        price: "₹18,000",
        link: "/bracelets"
      }
    ]
  },
  categories: [
    { name: "Bracelets", slug: "bracelets", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcIZXO82aWHKwgWbLCSx0uVJtIwMEw9sznR7JiZ_ZG1f0d6uiLC8iSPj_3u39wBB0r5z0O-JQxzzUI55yX2tTFslcPLhsoDf523TLoMJNDKt5wp3qhl0t5Hy5CVkTxWlGhMXXQDBOu2nPOXnkl7YFuOJVoziCb8P_6ldZ0wI8ZKhnUwydEkUoa8_u1lH6NlFwIsRvyp42ZCLKK_rPXzMiHT2vkobzr3JMmkTJlqlvHpnBvaTmUKkC3Oucv9fOaGOe_V8sZsrrfgWqS" },
    { name: "Necklaces", slug: "necklaces", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzW9PuEl6eWE-M3r3MlxJ3OTWayiBHnU56HMxbDj3fQE--qKG-W8GDWYiRS19CMTmFCm8SPON6xBddEgA8Yi0czVt68HcZ1DmAZiygSOVBV2_1uQbprJkAurSEB6HKlzGaWYNpVi_J0YztvOGzuK4KUkWvrg_rZPx43RxROa4poSEGdUz5J9r6BcuKDY8RVd0vz_N6zo5R2a5G5SARWM9QASaav2pxWdQQDSRjK_pufSv89h630ixt-Kd3f3CCG-7Xfez3CbpxA4Gw" },
    { name: "Bridal", slug: "bridal", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCU5GyugSuyr6C--PwVe1hM0gMwITQmzadOQ5tygnjMd5Zs-SY09oU50p9t3AQemU0q4OMnloyHYvIe4Mi48GAhCoSlOuzO5XdSSw0xcIP-opTGbUW_0xokqXN9P8hunm7o-e9ZyoL9rM-ochRk-nOk3jfewQgm6srCts-r7TUbrG4sdRzmsHpj_Rp-yDvSExhYS-tntX2jU1ic5aL5bie-Fz-Zw06kyaz8KPCgF9QumT3PMMaR90-L0wzAbXfE7HsN3Q8IDGr2hT_7" }
  ],
  materials: ["Gold", "Platinum", "Diamond", "Polki", "Pearl"],
  navigation: {
    main: [
      { name: "Bracelets", href: "/bracelets" },
      { name: "Necklaces", href: "/necklaces" },
      { name: "Korean Jewelry", href: "/korean" },
      { name: "Bridal", href: "/bridal" }
    ],
    support: [
      { name: "Track Order", href: "/track-order" },
      { name: "Shipping & Returns", href: "/info/shipping-and-returns" },
      { name: "Care Guide", href: "/info/care-guide" }
    ],
    company: [
      { name: "About Us", href: "/info/about-us" },
      { name: "Privacy Policy", href: "/info/privacy-policy" },
      { name: "Terms of Service", href: "/info/terms-of-service" }
    ],
    social: [
      { icon: "public", href: "#" },
      { icon: "mail", href: "#" },
      { icon: "share", href: "#" }
    ]
  },
  footer: {
    brandName: "Marbie Jewels",
    description: "Crafting heritage jewelry for the modern woman who values understated elegance and timeless craftsmanship.",
    copyright: "© 2026 Marbie Fine Jewelry. All Rights Reserved."
  }
};

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: 101,
    title: "Perfect wedding jewelry!",
    author: "Aarti",
    time: "2 days ago",
    rating: 5,
    content: "Thank you so much, Team Marbie Jewels! I'm absolutely loving my bridal jewellery - it added the perfect touch to my wedding look. The quality and design exceeded my expectations, and I'm so happy to have chosen your brand.",
    product: "Aurora Gold Ring",
    verified: true,
    image: "/images/Beautiful_Indian_woman_with_soft_202606232200.jpeg"
  },
  {
    id: 102,
    title: "Compliments guaranteed!",
    author: "Shreshtha",
    time: "1 week ago",
    rating: 5,
    content: "I bought a choker set and earrings from Marbie, and they were just perfect for my Haldi look. I got so many compliments! And the best part, even after a full pool session, they're still perfect and haven't tarnished till date.",
    product: "Verdant Drops",
    verified: true,
    image: "/images/zoom_of_Beautiful_Indian_woman_202606232030 (1).jpeg"
  },
  {
    id: 103,
    title: "Exquisite detailing",
    author: "Ayushi",
    time: "2 weeks ago",
    rating: 5,
    content: "It gave my festive outfit a beautiful uplift, adding both sophistication and traditional warmth. The detailing is exquisite and matched the festive vibe perfectly. So happy with how it turned out in pictures and in person!",
    product: "Lumina Bracelet",
    verified: true,
    image: "/images/zoom_of_Beautiful_Indian_woman_202606232030 (2).jpeg"
  },
  {
    id: 104,
    title: "Stunning craftsmanship",
    author: "Wamiqa",
    time: "3 weeks ago",
    rating: 5,
    content: "The Kundan work is royal and lightweight. I wore this suite for my reception for over 8 hours without any discomfort. Absolutely worth every rupee!",
    product: "Essence Chain",
    verified: true,
    image: "/images/WhatsApp Image 2026-06-23 at 23.11.23.jpeg"
  },
  {
    id: 105,
    title: "Loved by everyone",
    author: "Ashnoor",
    time: "1 month ago",
    rating: 5,
    content: "Such a breathtaking design. The gold plating looks truly rich and pure. Customer support was also very helpful with express shipping.",
    product: "Aurora Gold Ring",
    verified: true,
    image: "/images/WhatsApp Image 2026-06-25 at 15.32.38.jpeg"
  }
];

// Read database data
export function getDbData(): DbSchema {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      // Return empty database schema if not present yet
      return { products: [], orders: [], customers: [], reviews: DEFAULT_REVIEWS, config: DEFAULT_CONFIG, carousel: [] };
    }
    const rawData = fs.readFileSync(DB_FILE_PATH, "utf-8");
    const db = JSON.parse(rawData);
    const config = db.config || {};
    return {
      products: Array.isArray(db.products) ? db.products : [],
      orders: Array.isArray(db.orders) ? db.orders : [],
      customers: Array.isArray(db.customers) ? db.customers : [],
      reviews: Array.isArray(db.reviews) && db.reviews.length > 0 ? db.reviews : DEFAULT_REVIEWS,
      config: {
        ...DEFAULT_CONFIG,
        ...config,
        marketing: {
          ...DEFAULT_CONFIG.marketing,
          ...(config.marketing || {})
        },
        labels: {
          ...DEFAULT_CONFIG.labels,
          ...(config.labels || {})
        },
        navigation: {
          ...DEFAULT_CONFIG.navigation,
          ...(config.navigation || {})
        },
        footer: {
          ...DEFAULT_CONFIG.footer,
          ...(config.footer || {})
        }
      },
      carousel: Array.isArray(db.carousel) ? db.carousel : [],
      subscribers: Array.isArray(db.subscribers) ? db.subscribers : [
        { id: "sub-1", email: "royal.bride@vogue.in", date: "2026-06-20", status: "active" },
        { id: "sub-2", email: "ananya.sharma@gmail.com", date: "2026-06-22", status: "active" },
        { id: "sub-3", email: "priyanka.chopra@celeb.com", date: "2026-06-25", status: "active" }
      ],
      campaigns: Array.isArray(db.campaigns) ? db.campaigns : [
        {
          id: "camp-1",
          subject: "👑 Royal Summer Bridal Drop - Gilded Steals",
          banner: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCiszRq5LNv5_06qoHu5y0glWLWVdZFWWnWug4_HzcsHjoNfQiGjnoIRv2HQRRXCRJxfJobyX7XVZ6u__BigftYGOz27MY2TV6pOX3hlObr4wgmqEQoC7ornVSjWZUqsI22odDzbZ6dtUW3q490DzPW9J17JV7Imao5L1RYU9y95U0JhVZCc9IEE3Z269ViUUNDWxJXSG_s-4BkljJQZjgma1iziyNTp83HvT6naXjn5oFPxTbVmmjnCNXLdTJn6_8sM25V_sV661g",
          title: "The Gilded Royal Summer Collection",
          body: "Dearest Royal Bride,\n\nWe are thrilled to unveil our exclusive summer curation of handcrafted Kundan and Polki masterpieces. Designed for Haldi soirées and grand wedding galas, each piece is gilded in 18K gold and hallmarked for purity.\n\nEnjoy complimentary VIP concierge express shipping on all orders this week.",
          ctaText: "EXPLORE THE ROYAL DROP",
          ctaLink: "http://localhost:3000/necklaces",
          date: "2026-06-24",
          recipients: 3
        }
      ]
    };
  } catch (error) {
    console.error("Failed to read JSON database:", error);
    return { products: [], orders: [], customers: [], reviews: [], config: DEFAULT_CONFIG, carousel: [], subscribers: [], campaigns: [] };
  }
}

// Write database data
export function saveDbData(data: DbSchema): boolean {
  try {
    const dirPath = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to write to JSON database:", error);
    return false;
  }
}
