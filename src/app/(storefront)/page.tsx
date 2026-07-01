"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard, { ProductProps } from "@/components/ProductCard";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { isVideo } from "@/lib/media";

const DEFAULT_TROUSSEAU = [
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
    title: "Reception SoirÃ©e",
    subtitle: "CONTEMPORARY SOPHISTICATION",
    desc: "Sleek platinum finishes, emerald focal stones, and modern tennis bracelets for a red-carpet finish.",
    image: "/images/WhatsApp Image 2026-06-25 at 15.32.38.jpeg",
    highlight: "Imperial Emerald Cuff",
    price: "₹18,000",
    link: "/bracelets"
  }
];


gsap.registerPlugin(ScrollTrigger);

const MagneticButton = ({ children, href, className, style, onClick }: any) => {
  const magneticRef = React.useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = magneticRef.current;
    if(!el) return;
    const xTo = gsap.quickTo(el, "x", {duration: 1, ease: "elastic.out(1, 0.3)"});
    const yTo = gsap.quickTo(el, "y", {duration: 1, ease: "elastic.out(1, 0.3)"});
    
    const mouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = el.getBoundingClientRect();
      const x = clientX - (left + width/2);
      const y = clientY - (top + height/2);
      xTo(x * 0.35);
      yTo(y * 0.35);
    };
    const mouseLeave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("mousemove", mouseMove);
    el.addEventListener("mouseleave", mouseLeave);
    return () => {
      el.removeEventListener("mousemove", mouseMove);
      el.removeEventListener("mouseleave", mouseLeave);
    };
  }, { scope: magneticRef });

  if(href) {
    return <div ref={magneticRef} style={{ display: "inline-block" }}><Link href={href} className={className} style={{...style, display: "inline-block"}} onClick={onClick}>{children}</Link></div>;
  }
  return <div ref={magneticRef} style={{ display: "inline-block" }}><button className={className} style={{...style, display: "inline-block", border: "none"}} onClick={onClick}>{children}</button></div>;
};

const DEFAULT_HERO_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuBCiszRq5LNv5_06qoHu5y0glWLWVdZFWWnWug4_HzcsHjoNfQiGjnoIRv2HQRRXCRJxfJobyX7XVZ6u__BigftYGOz27MY2TV6pOX3hlObr4wgmqEQoC7ornVSjWZUqsI22odDzbZ6dtUW3q490DzPW9J17JV7Imao5L1RYU9y95U0JhVZCc9IEE3Z269ViUUNDWxJXSG_s-4BkljJQZjgma1iziyNTp83HvT6naXjn5oFPxTbVmmjnCNXLdTJn6_8sM25V_sV661g";

export default function Home() {
  const mainRef = React.useRef<HTMLDivElement>(null);
  const trousseauRef = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Scroll Reveals
    const revealElements = gsap.utils.toArray('.gsap-reveal');
    revealElements.forEach((el: any) => {
      gsap.fromTo(el, 
        { opacity: 0, y: 50 }, 
        { 
          opacity: 1, y: 0, 
          duration: 1, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Parallax Hero
    gsap.to(".hero-bg-parallax", {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    // Staggered Hero Text
    gsap.fromTo(".hero-stagger", 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power4.out", delay: 0.5 }
    );
    
  }, { scope: mainRef });
  
  // Trousseau crossfade logic
  const handleTrousseauChange = (idx: number) => {
    if (idx === activeOccasion) return;
    const tl = gsap.timeline();
    tl.to(".trousseau-content", { opacity: 0, scale: 0.98, duration: 0.3, ease: "power2.inOut" })
      .call(() => setActiveOccasion(idx))
      .to(".trousseau-content", { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
  };

  const [config, setConfig] = useState<any>(null);
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeOccasion, setActiveOccasion] = useState(0);
  const [carouselSlides, setCarouselSlides] = useState<any[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);

  const trousseauOccasions = (config?.marketing?.trousseau?.length > 0 ? config.marketing.trousseau : DEFAULT_TROUSSEAU);
  const trousseauTitle = config?.marketing?.trousseauTitle || "THE ROYAL BRIDAL TROUSSEAU";
  const trousseauSubtitle = config?.marketing?.trousseauSubtitle || "INTERACTIVE CURATION";
  const currentOccasion = trousseauOccasions[activeOccasion] || trousseauOccasions[0] || {};

  useEffect(() => {
    Promise.all([
      fetch("/api/config").then(res => res.json()),
      fetch("/api/products").then(res => res.json()),
      fetch("/api/carousel").then(res => res.json()),
    ])
    .then(([cfg, prods, slides]) => {
      if (!cfg.marketing) cfg.marketing = {};
      if (!cfg.marketing.offers) {
        cfg.marketing.offers = [
          { id: "offer-1", title: "Summer Trend Drop", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCiszRq5LNv5_06qoHu5y0glWLWVdZFWWnWug4_HzcsHjoNfQiGjnoIRv2HQRRXCRJxfJobyX7XVZ6u__BigftYGOz27MY2TV6pOX3hlObr4wgmqEQoC7ornVSjWZUqsI22odDzbZ6dtUW3q490DzPW9J17JV7Imao5L1RYU9y95U0JhVZCc9IEE3Z269ViUUNDWxJXSG_s-4BkljJQZjgma1iziyNTp83HvT6naXjn5oFPxTbVmmjnCNXLdTJn6_8sM25V_sV661g", link: "/necklaces" },
          { id: "offer-2", title: "Royal Kundan Steals", image: "/images/lookbook_hero.png", link: "/bracelets" }
        ];
      }
      setConfig(cfg);
      if (Array.isArray(prods)) setProducts(prods);
      if (Array.isArray(slides)) {
        const activeSlides = slides.filter((s: any) => s.active && s.image);
        setCarouselSlides(activeSlides);
      }
      setIsLoading(false);
    })
    .catch(err => {
      console.error("Error loading storefront data", err);
      setIsLoading(false);
    });
  }, []);

  // Auto-advance hero carousel every 5 seconds
  useEffect(() => {
    if (carouselSlides.length < 2) return;
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselSlides]);

  if (isLoading || !config) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", background: "var(--color-surface)" }}>
        <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--color-primary)" }}>diamond</span>
        <div style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.2em", color: "var(--color-on-surface-variant)", textTransform: "uppercase" }}>Loading Storefront...</div>
      </div>
    );
  }

  // Display top 4 new arrivals (matching exact Stitch catalog items)
  const displayArrivals = products.slice(0, 4);
  const displayBestsellers = products.length > 4 ? [...products].reverse().slice(0, 4) : products.slice(0, 4);

  const layout = config.marketing?.layout || {};
  const isVisible = (key: string) => layout[key] !== false;

    // Build ordered list of sections
  const sectionOrder: { key: string; order: number }[] = [
    { key: "marquee",    order: layout.orderMarquee    ?? 1 },
    { key: "hero",       order: layout.orderHero       ?? 2 },
    { key: "categories", order: layout.orderCategories ?? 3 },
    { key: "offers",     order: layout.orderOffers     ?? 4 },
    { key: "arrivals",   order: layout.orderArrivals   ?? 5 },
    { key: "bestsellers",order: layout.orderBestsellers?? 5.5 },
    { key: "trousseau",  order: layout.orderTrousseau  ?? 6 },
    { key: "instagram",  order: layout.orderInstagram  ?? 7 },
    { key: "reviews",    order: layout.orderReviews    ?? 8 },
  ].sort((a, b) => a.order - b.order);

  // --- Section Definitions (ordered + visibility controlled) ---
  const sectionMap: Record<string, React.ReactNode> = {
    marquee: isVisible("showMarquee") ? (
      <Link key="marquee" href={config?.marketing?.marqueeLink || "/lookbook"} style={{ textDecoration: "none", display: "block" }}>
        <div
          className="announcement-marquee"
          style={{
            background: config?.marketing?.marqueeBgColor || "linear-gradient(90deg, #00241b 0%, #0a4d3c 50%, #00241b 100%)",
            color: config?.marketing?.marqueeTextColor || "#fed65b",
            cursor: "pointer"
          }}
        >
          <div className="marquee-track">
            {config?.marketing?.marqueeText || "✧ OVER 50,000+ ROYAL BRIDES STYLED GLOBALLY • TRUSTED BY TOP CELEBRITY STYLISTS • 100% ROYAL INDIAN CRAFTSMANSHIP • LIFETIME GOLD PLATING GUARANTEE • EXPRESS FREE INSURED SHIPPING ✧ OVER 50,000+ ROYAL BRIDES STYLED GLOBALLY • TRUSTED BY TOP CELEBRITY STYLISTS • 100% ROYAL INDIAN CRAFTSMANSHIP ✧"}
          </div>
        </div>
      </Link>
    ) : null,

    hero: isVisible("showHero") ? (
      <section key="hero" className="hero" data-ratio={config?.heroRatio || "default"}>
        <div className="hero-bg hero-bg-parallax">
          <div className="hero-overlay"></div>
          <AnimatePresence mode="sync">
            {carouselSlides.length > 0 ? (
              carouselSlides.map((slide: any, i: number) =>
                i === heroIndex ? (
                  isVideo(slide.image) ? (
                    <motion.video
                      key={slide.image}
                      src={slide.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="hero-img"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ opacity: { duration: 0.9, ease: "easeInOut" }, scale: { duration: 15, ease: "easeOut" } }}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <motion.div
                      key={slide.image}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ opacity: { duration: 0.9, ease: "easeInOut" }, scale: { duration: 15, ease: "easeOut" } }}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                    >
                      <Image alt={slide.title || "Marbie hero"} className="hero-img" src={slide.image} fill style={{ objectFit: "cover" }} quality={100} priority />
                    </motion.div>
                  )
                ) : null
              )
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ opacity: { duration: 0.9, ease: "easeInOut" }, scale: { duration: 15, ease: "easeOut" } }}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              >
                <Image alt="Luxury jewelry model" className="hero-img" src={DEFAULT_HERO_IMAGE} fill style={{ objectFit: "cover" }} quality={100} priority />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {carouselSlides.length > 1 && (
          <div style={{ position: "absolute", bottom: "28px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 10 }}>
            {carouselSlides.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{ width: i === heroIndex ? "28px" : "8px", height: "8px", borderRadius: "100px", backgroundColor: i === heroIndex ? "#fed65b" : "rgba(255,255,255,0.5)", border: "none", cursor: "pointer", transition: "all 0.35s ease", padding: 0 }}
              />
            ))}
          </div>
        )}

        <div className="container hero-content">
          <motion.div initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }} className="hero-text-box">
            <span className="hero-label hero-stagger">{config.marketing?.hero?.subtitle || "LUXURY REDEFINED"}</span>
            <h1 className="hero-title hero-stagger" style={{ whiteSpace: "pre-line" }}>
              {config.marketing?.hero?.title || "Timeless Elegance,\nCrafted for You"}
            </h1>
            <p className="hero-description hero-stagger">
              {config.marketing?.hero?.description || "Discover our exquisite collection of handcrafted heritage pieces. Sophistication begins at ₹500."}
            </p>
            <div className="hero-buttons">
              <MagneticButton href={config.labels?.heroButtons?.primaryLink || "/necklaces"} className="btn-hero-primary hero-stagger">
                {config.labels?.heroButtons?.primary || "Shop the Collection"}
              </MagneticButton>
              <MagneticButton href={config.labels?.heroButtons?.secondaryLink || "/lookbook"} className="btn-hero-secondary hero-stagger">
                {config.labels?.heroButtons?.secondary || "View Lookbook"}
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>
    ) : null,

    categories: isVisible("showCategories") ? (
      <section key="categories" className="section-categories">
        <div className="container">
          <div className="section-title-wrap gsap-reveal">
            <h2 className="section-title">{config.labels?.categorySection?.title || "Shop by Category"}</h2>
            <div className="section-divider"></div>
          </div>
          <div className="category-grid">
            {(config.categories || []).slice(0, 3).map((cat: any, idx: number) => (
              <motion.div key={cat.slug || idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }} whileHover="hover">
                <Link href={`/${cat.slug}`} className="category-card" style={{ textDecoration: "none", display: "block", position: "relative", overflow: "hidden", borderRadius: "16px" }}>
                  <motion.div variants={{ hover: { scale: 1.08, transition: { duration: 1.2, ease: "easeOut" } } }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                    <Image alt={cat.name} className="category-img" src={cat.image} fill style={{ objectFit: "cover" }} quality={90} />
                  </motion.div>
                  <div className="category-overlay"></div>
                  <div className="category-content">
                    <motion.h3 className="category-name" variants={{ hover: { y: -5, transition: { duration: 0.3 } } }}>{cat.name}</motion.h3>
                    <motion.p className="category-link" variants={{ hover: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.1 } } }} style={{ opacity: 0.8 }}>
                      {config.labels?.categorySection?.exploreText || "EXPLORE COLLECTION"}
                    </motion.p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    offers: isVisible("showOffers") && (config.marketing?.offers || []).length > 0 ? (
      <section key="offers" className="section-offers" style={{ padding: "64px 0", backgroundColor: "var(--color-surface)" }}>
        <div className="container">
          <div className="section-title-wrap" style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 className="section-title" style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, letterSpacing: "0.25em", color: "var(--color-on-surface)", margin: "0 0 16px 0", textTransform: "uppercase" }}>
              {config.marketing?.offersTitle || "OFFERS"}
            </h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", color: "var(--color-primary)" }}>
              <span style={{ height: "1px", width: "80px", backgroundColor: "rgba(0,36,27,0.2)" }}></span>
              {config.marketing?.sectionDividerImage ? (
                <img src={config.marketing.sectionDividerImage} alt="" style={{ height: "24px", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: "16px", letterSpacing: "4px" }}>✧ ✿ ✧</span>
              )}
              <span style={{ height: "1px", width: "80px", backgroundColor: "rgba(0,36,27,0.2)" }}></span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: "32px" }}>
            {(config.marketing?.offers || []).map((offer: any, oIdx: number) => (
              <motion.div key={offer.id || oIdx} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: oIdx * 0.15 }}>
                <Link href={offer.link || "/necklaces"} style={{ textDecoration: "none", display: "block", position: "relative", overflow: "hidden", borderRadius: "16px", boxShadow: "0 12px 36px rgba(0,36,27,0.08)", backgroundColor: "var(--color-surface-container)" }} className="hover-zoom group hover-lift">
                  <div style={{ aspectRatio: "16/9", width: "100%", position: "relative", overflow: "hidden" }}>
                    <Image src={offer.image} alt={offer.title || "Promotional Offer"} fill style={{ objectFit: "cover", transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }} className="group-hover:scale-105" quality={90} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    arrivals: isVisible("showNewArrivals") ? (
      <section key="arrivals" className="section-arrivals">
        <div className="container">
          <div className="arrivals-header gsap-reveal">
            <div>
              <h2 className="section-title" style={{ textAlign: "left" }}>{config.labels?.arrivalsSection?.title || "New Arrivals"}</h2>
              <p className="arrivals-subtitle">{config.labels?.arrivalsSection?.subtitle || "Hand-selected pieces from our latest curation."}</p>
            </div>
            <Link href={config.labels?.arrivalsSection?.viewAllLink || "/necklaces"} className="view-all-link">
              {config.labels?.arrivalsSection?.viewAllText || "VIEW ALL PIECES"}
            </Link>
          </div>
          <div className="products-grid">
            {displayArrivals.map((product: ProductProps) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    ) : null,

    bestsellers: isVisible("showBestsellers") ? (
      <section key="bestsellers" className="section-arrivals" style={{ backgroundColor: "var(--color-surface)", paddingBottom: "64px" }}>
        <div className="container">
          <div className="arrivals-header gsap-reveal">
            <div>
              <h2 className="section-title" style={{ textAlign: "left" }}>{config.labels?.bestsellersSection?.title || "Best Sellers"}</h2>
              <p className="arrivals-subtitle">{config.labels?.bestsellersSection?.subtitle || "Our most coveted pieces, loved by royal brides."}</p>
            </div>
            <Link href={config.labels?.bestsellersSection?.viewAllLink || "/necklaces"} className="view-all-link">
              {config.labels?.bestsellersSection?.viewAllText || "SHOP BEST SELLERS"}
            </Link>
          </div>
          <div className="products-grid">
            {displayBestsellers.map((product: ProductProps) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    ) : null,

    trousseau: isVisible("showTrousseau") ? (
      <section key="trousseau" className="section-trousseau" style={{ padding: "96px 0", background: "linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-container) 100%)", borderTop: "1px solid var(--color-outline-variant)", borderBottom: "1px solid var(--color-outline-variant)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.3em", color: "var(--color-primary)", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>{trousseauSubtitle}</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: 700, letterSpacing: "0.2em", color: "var(--color-on-surface)", margin: "0 0 16px 0", textTransform: "uppercase" }}>{trousseauTitle}</h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", color: "var(--color-primary)" }}>
              <span style={{ height: "1px", width: "60px", backgroundColor: "rgba(0,36,27,0.2)" }}></span>
              {config.marketing?.sectionDividerImage ? (
                <img src={config.marketing.sectionDividerImage} alt="" style={{ height: "24px", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: "16px", letterSpacing: "4px" }}>✧ ✿ ✧</span>
              )}
              <span style={{ height: "1px", width: "60px", backgroundColor: "rgba(0,36,27,0.2)" }}></span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", marginBottom: "40px" }}>
            {trousseauOccasions.map((occ: any, idx: number) => {
              const isActive = activeOccasion === idx;
              return (
                <button key={occ.id || idx} onClick={() => handleTrousseauChange(idx)} style={{ padding: "14px 28px", borderRadius: "40px", fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", transition: "color 0.3s cubic-bezier(0.16, 1, 0.3, 1)", border: isActive ? "1px solid transparent" : "1px solid var(--color-outline-variant)", backgroundColor: "transparent", color: isActive ? "var(--color-on-primary)" : "var(--color-on-surface)", position: "relative", overflow: "hidden", zIndex: 1 }} type="button">
                  {isActive && (
                    <motion.div layoutId="trousseau-active-tab" style={{ position: "absolute", inset: 0, backgroundColor: "var(--color-primary)", borderRadius: "40px", boxShadow: "0 8px 24px rgba(0,36,27,0.2)", zIndex: -1 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                  {occ.title}
                </button>
              );
            })}
          </div>
          <div>
            {currentOccasion && (
              <div className="trousseau-content" style={{ backgroundColor: "var(--color-surface)", borderRadius: "24px", border: "1px solid var(--color-outline-variant)", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,36,27,0.08)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
                <div style={{ position: "relative", minHeight: "420px", overflow: "hidden" }}>
                  <Image src={currentOccasion.image} alt={currentOccasion.title} fill style={{ objectFit: "cover", display: "block" }} quality={90} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 60%)" }}></div>
                  <div style={{ position: "absolute", bottom: "24px", left: "24px", color: "#fff" }}>
                    <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", padding: "4px 10px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.3)", display: "inline-block", marginBottom: "8px" }}>{currentOccasion.subtitle}</span>
                    <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", margin: 0, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>{currentOccasion.title}</h3>
                  </div>
                </div>
                <div style={{ padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "24px", background: "var(--color-surface)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-secondary)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>auto_awesome</span>
                    Master Stylist Curation
                  </div>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "32px", color: "var(--color-primary)", margin: 0, lineHeight: 1.2 }}>{currentOccasion.highlight}</h3>
                  <p style={{ fontSize: "15px", color: "var(--color-on-surface-variant)", lineHeight: 1.8, margin: 0 }}>{currentOccasion.desc}</p>
                  <div style={{ padding: "20px", backgroundColor: "var(--color-surface-container)", borderRadius: "12px", border: "1px dashed var(--color-outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block" }}>Curated Suite Starts At</span>
                      <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--color-on-surface)", fontFamily: "var(--font-display)" }}>{currentOccasion.price}</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--color-primary)", fontWeight: 600, backgroundColor: "rgba(0,36,27,0.08)", padding: "6px 12px", borderRadius: "20px" }}>✦ Hallmarked Purity</span>
                  </div>
                  <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                    <Link href={currentOccasion.link || "/necklaces"} className="btn-primary hover-scale" style={{ flex: 1, padding: "18px 24px", textAlign: "center", textDecoration: "none", fontSize: "12px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      EXPLORE OCCASION PIECES
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    ) : null,

    instagram: isVisible("showInstagram") ? (
      <section key="instagram" className="section-instagram">
        <div className="container">
          <h3 className="insta-handle gsap-reveal">{config.labels?.instagramSection?.handle || "@MARBIE_JEWELRY"}</h3>
          <div className="insta-grid">
            {(config.marketing?.instagram || []).filter((item: any) => !item.hidden).slice(0, 6).map((item: any, index: number) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}>
                <Link href="/earrings" style={{ display: "block", position: "relative", overflow: "hidden", height: "100%" }}>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ width: "100%", height: "100%" }}>
                    {item.type === "video" ? (
                      <video src={item.url} className="insta-img" autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <Image fill alt={`Instagram ${index + 1}`} className="insta-img" src={item.url} style={{ objectFit: "cover", display: "block" }} quality={90} />
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    
    reviews: isVisible("showReviews") ? (
      <ReviewsCarousel key="reviews" />
    ) : null,
  };

  return (
    <main ref={mainRef}>
      {sectionOrder.map(({ key }) => sectionMap[key] ?? null)}
    </main>
  );
}
