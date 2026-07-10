"use client";

import React, { useState, useEffect, Suspense } from "react";
import { notFound, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

const customEase = [0.25, 0.46, 0.45, 0.94] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: customEase } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function DynamicCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading collection...</div>}>
      <CollectionContent slug={slug} />
    </Suspense>
  );
}

function CollectionContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [collection, setCollection] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [materialsList, setMaterialsList] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<{name: string, slug: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    setIsMobileView(window.innerWidth < 1024);
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filters state
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [availableColors, setAvailableColors] = useState<{name: string, hex: string}[]>([]);
  const [sortOption, setSortOption] = useState("price-desc");

  // Accordion & UI states matching reference
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isColorOpen, setIsColorOpen] = useState(true);
  const [isMaterialOpen, setIsMaterialOpen] = useState(true);
  const [showMoreColors, setShowMoreColors] = useState(false);
  const [showMoreMaterials, setShowMoreMaterials] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    Promise.all([
      fetch("/api/collections").then(res => res.json()),
      fetch("/api/products").then(res => res.json()),
      fetch("/api/config").then(res => res.json())
    ])
    .then(([collections, allProducts, config]) => {
      const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();
      let found = null;
      if (decodedSlug === "all" || decodedSlug === "search") {
        found = {
          slug: decodedSlug,
          title: decodedSlug === "search" && query ? `Search: ${query}` : "All Products",
          description: "Discover our complete collection.",
          bannerImage: config?.storefront?.allProductsBanner || "/images/all_products_banner_new.png",
          filterCategory: "",
          heroRatio: "tall"
        };
      } else {
        found = (collections || []).find((c: any) => {
          const cSlug = (c.slug || "").toLowerCase().trim();
          if (cSlug === decodedSlug) return true;
          if ((cSlug === "bangels" && decodedSlug === "bangles") || (cSlug === "bangles" && decodedSlug === "bangels")) return true;
          return false;
        });
      }

      if (!found) {
        const matchingProds = (allProducts || []).filter((p: any) => {
          const pCat = (p.category || "").toLowerCase().trim();
          const pSub = (p.subcategory || "").toLowerCase().trim();
          return pCat.includes(decodedSlug) || decodedSlug.includes(pCat) || pSub.includes(decodedSlug);
        });
        const knownCat = (config?.categories || []).find((cat: any) => (cat.slug || "").toLowerCase().trim() === decodedSlug);

        if (matchingProds.length > 0 || knownCat) {
          found = {
            slug: decodedSlug,
            title: knownCat?.name || (decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1)),
            description: `Explore our handcrafted ${knownCat?.name || decodedSlug} collection.`,
            bannerImage: knownCat?.image || "",
            filterCategory: decodedSlug,
            heroRatio: "tall"
          };
        } else {
          notFound();
          return;
        }
      }
      setCollection(found);
      setMaterialsList(config.materials || ["18K Gold", "14K Gold", "Diamonds", "Polki", "Pure Gold", "Sterling Silver"]);

      const targetCategory = (found.filterCategory || found.slug || "").toLowerCase().trim();
      const targetSlug = (found.slug || decodedSlug).toLowerCase().trim();

      const normalizeCat = (str: string) => {
        if (!str) return "";
        let s = str.toLowerCase().trim();
        if (s.endsWith("ies")) return s.slice(0, -3) + "y";
        if (s.endsWith("es") && !s.endsWith("sses")) return s.slice(0, -2);
        if (s.endsWith("s") && !s.endsWith("ss")) return s.slice(0, -1);
        return s;
      };

      const normSlug = normalizeCat(targetSlug);
      const normFilter = normalizeCat(targetCategory);

      const filtered = (allProducts || []).filter((p: any) => {
        if (decodedSlug === "search") {
          if (!query) return true;
          const q = query.toLowerCase();
          return p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q);
        }
        if (decodedSlug === "all") return true;
        const pCat = normalizeCat(p.category || "");
        if (!pCat) return false;
        return pCat === normSlug || (normFilter && pCat === normFilter);
      });
      setProducts(filtered);

      // Dynamically extract colors that actually exist on the products in this category
      const productColors = new Set<string>();
      filtered.forEach((p: any) => {
        if (Array.isArray(p.colors)) {
          p.colors.forEach((c: any) => {
            if (c.name) productColors.add(c.name.toLowerCase().trim());
          });
        }
      });
      
      let catColors = config.colors || [];
      catColors = catColors.filter((c: any) => productColors.has((c.name || "").toLowerCase().trim()));
      setAvailableColors(catColors);

      // Dynamically extract materials that actually exist on the products in this category
      const defaultMaterials = config.materials || ["18K Gold", "14K Gold", "Diamonds", "Polki", "Pure Gold", "Sterling Silver"];
      const activeMaterials = defaultMaterials.filter((mat: string) => {
        return filtered.some((p: any) => (p.subcategory || p.description || "").toLowerCase().includes(mat.toLowerCase()));
      });
      setMaterialsList(activeMaterials);
      const catsToUse = (config?.categories && config.categories.length > 0)
        ? config.categories.map((c: any) => ({ name: c.name, slug: c.slug }))
        : (collections && collections.length > 0)
          ? collections.map((c: any) => ({ name: c.title?.trim() || c.slug, slug: c.slug }))
          : [
              { name: "Bracelets", slug: "bracelets" },
              { name: "Necklaces", slug: "necklaces" },
              { name: "Korean Jewelry", slug: "korean" },
              { name: "Bridal", slug: "bridal" },
            ];
      setAllCategories(catsToUse);

      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [slug, query]);

  const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();
  const displayTitle = collection?.title || (decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1));

  // If we have loaded and no collection was found, show a 404 state
  if (!isLoading && !collection) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px" }}>
        <h1 style={{ fontSize: "72px", margin: "0 0 16px 0", color: "var(--color-primary)", fontFamily: "var(--font-display)" }}>404</h1>
        <h2 style={{ fontSize: "24px", margin: "0 0 16px 0", color: "var(--color-on-surface)" }}>Page Not Found</h2>
        <p style={{ color: "var(--color-on-surface-variant)", maxWidth: "400px", marginBottom: "32px", lineHeight: "1.6" }}>
          We couldn't find the page or collection you were looking for. It might have been moved or doesn't exist.
        </p>
        <Link href="/" className="btn-primary" style={{ textDecoration: "none", padding: "12px 32px", display: "inline-block" }}>
          RETURN TO HOME
        </Link>
      </div>
    );
  }

  const handleMaterialChange = (material: string) => {
    if (selectedMaterials.includes(material)) {
      setSelectedMaterials(selectedMaterials.filter((m) => m !== material));
    } else {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (p.price > maxPrice) return false;
    if (selectedMaterials.length > 0) {
      const pSub = (p.subcategory || p.category || "").toLowerCase();
      const pDesc = (p.description || "").toLowerCase();
      const matchesMat = selectedMaterials.some(m => pSub.includes(m.toLowerCase()) || pDesc.includes(m.toLowerCase()));
      if (!matchesMat) return false;
    }
    if (selectedColor) {
      const hasCol = p.colors?.some((c: any) => (c.name || "").toLowerCase().trim() === selectedColor.toLowerCase().trim());
      if (!hasCol) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortOption === "price-asc") return a.price - b.price;
    if (sortOption === "price-desc") return b.price - a.price;
    if (sortOption === "name-asc") return a.name.localeCompare(b.name);
    if (sortOption === "rating-desc") return (b.rating || 0) - (a.rating || 0);
    return 0; // recommended
  });

  const activeFilterCount = (maxPrice < 5000 ? 1 : 0) + selectedMaterials.length + (selectedColor ? 1 : 0);

  const getBannerStyle = () => {
    const ratio = collection?.heroRatio || "cover";
    if (ratio === "contain") return { position: "relative" as const, overflow: "hidden" as const, backgroundColor: "var(--color-surface-container)", minHeight: "450px" };
    if (ratio === "tall") return { position: "relative" as const, overflow: "hidden" as const, backgroundColor: "var(--color-surface-container)", minHeight: "550px" };
    if (ratio === "compact") return { position: "relative" as const, overflow: "hidden" as const, backgroundColor: "var(--color-surface-container)", minHeight: "220px" };
    return { position: "relative" as const, overflow: "hidden" as const, backgroundColor: "var(--color-surface-container)" };
  };

  const getMediaStyle = () => {
    const ratio = collection?.heroRatio || "cover";
    if (ratio === "contain") return { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain" as const, zIndex: 0 };
    return { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" as const, objectPosition: "center", zIndex: 0 };
  };

  const clearAllFilters = () => {
    setMaxPrice(5000);
    setSelectedMaterials([]);
    setSelectedColor(null);
  };

  const renderFilterPanelContent = (isModal = false) => {
    const displayedColors = showMoreColors ? availableColors : availableColors.slice(0, 5);
    const displayedMaterials = showMoreMaterials ? materialsList : materialsList.slice(0, 5);

    return (
      <div className="ref-filter-sidebar-wrap">
        {/* Modal Header */}
        {isModal && (
          <div className="filter-panel-header" style={{ padding: "0 0 16px 0", borderBottom: "1px solid var(--color-outline-variant)", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", display: "flex", alignItems: "center", gap: "8px", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>tune</span>
              Filters
            </h2>
            <button onClick={() => setIsFilterDrawerOpen(false)} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", display: "flex" }} type="button">
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>close</span>
            </button>
          </div>
        )}

        {/* 1. NOW SHOPPING BY Block */}
        <div className="ref-shopping-by-section">
          <h3 className="ref-shopping-heading">NOW SHOPPING BY</h3>
          
          <div className="ref-active-pill-list">
            {maxPrice < 5000 && (
              <div className="ref-active-pill" onClick={() => setMaxPrice(5000)}>
                <span>Price : ₹0.00 – ₹{maxPrice.toLocaleString()}.00</span>
                <span className="ref-pill-x">✕</span>
              </div>
            )}
            {selectedColor && (
              <div className="ref-active-pill" onClick={() => setSelectedColor(null)}>
                <span>Base Colour : {selectedColor}</span>
                <span className="ref-pill-x">✕</span>
              </div>
            )}
            {selectedMaterials.map((mat) => (
              <div key={mat} className="ref-active-pill" onClick={() => handleMaterialChange(mat)}>
                <span>Material : {mat}</span>
                <span className="ref-pill-x">✕</span>
              </div>
            ))}
          </div>

          {activeFilterCount > 0 ? (
            <button className="ref-clear-all-btn" onClick={clearAllFilters} type="button">
              Clear All
            </button>
          ) : (
            <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", margin: "4px 0 12px 0", fontStyle: "italic" }}>No active filters</p>
          )}

          <hr className="ref-section-divider" />
        </div>

        {/* 2. PRICE Accordion */}
        <div className="ref-filter-accordion">
          <div className="ref-accordion-trigger" onClick={() => setIsPriceOpen(!isPriceOpen)}>
            <span className="ref-accordion-title">PRICE RANGE (MAX)</span>
            <span className={`ref-chevron-icon ${isPriceOpen ? "open" : ""}`}>❯</span>
          </div>

          {isPriceOpen && (
            <div className="ref-accordion-content">
              <div className="ref-price-bubble-row">
                <span className="ref-price-bubble">₹0</span>
                <span className="ref-price-bubble active">₹{maxPrice.toLocaleString()}</span>
                <span className="ref-price-bubble">₹5,000</span>
              </div>

              <div className="ref-slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="5000" 
                  step="100" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(Number(e.target.value))} 
                  className="ref-range-slider"
                />
                <div className="ref-ruler-ticks">
                  <span>|</span><span>|</span><span>|</span><span>|</span><span>|</span><span>|</span><span>|</span><span>|</span><span>|</span><span>|</span><span>|</span>
                </div>
                <div className="ref-ruler-numbers" style={{ direction: "ltr" }}>
                  <span>0</span>
                  <span>1k</span>
                  <span>2k</span>
                  <span>3k</span>
                  <span>4k</span>
                  <span>5k</span>
                </div>
              </div>
            </div>
          )}
          
          <hr className="ref-section-divider" />
        </div>

        {/* 3. BASE COLOUR Accordion */}
        {availableColors.length > 0 && (
          <div className="ref-filter-accordion">
            <div className="ref-accordion-trigger" onClick={() => setIsColorOpen(!isColorOpen)}>
              <span className="ref-accordion-title">BASE COLOUR</span>
              <span className={`ref-chevron-icon ${isColorOpen ? "open" : ""}`}>❯</span>
            </div>

            {isColorOpen && (
              <div className="ref-accordion-content">
                <div className="ref-radio-list">
                  {displayedColors.map((col, idx) => {
                    const isSel = selectedColor === col.name;
                    const count = products.filter(p => p.colors?.some((c: any) => (c.name || "").toLowerCase().trim() === (col.name || "").toLowerCase().trim())).length;
                    return (
                      <label key={idx} className="ref-radio-row" onClick={() => setSelectedColor(isSel ? null : col.name)}>
                        <div className="ref-radio-label-left">
                          <span className={`ref-radio-circle ${isSel ? "selected" : ""}`}></span>
                          <span>{col.name}</span>
                        </div>
                        <span className="ref-radio-count">({count})</span>
                      </label>
                    );
                  })}
                </div>

                {availableColors.length > 5 && (
                  <button 
                    className="ref-show-more-btn" 
                    onClick={() => setShowMoreColors(!showMoreColors)}
                    type="button"
                  >
                    <span className="ref-radio-circle"></span>
                    Show {showMoreColors ? "Less" : "More"}
                  </button>
                )}
              </div>
            )}

            <hr className="ref-section-divider" />
          </div>
        )}

        {/* 4. BASE MATERIAL Accordion */}
        <div className="ref-filter-accordion">
          <div className="ref-accordion-trigger" onClick={() => setIsMaterialOpen(!isMaterialOpen)}>
            <span className="ref-accordion-title">BASE MATERIAL</span>
            <span className={`ref-chevron-icon ${isMaterialOpen ? "open" : ""}`}>❯</span>
          </div>

          {isMaterialOpen && (
            <div className="ref-accordion-content">
              <div className="ref-radio-list">
                {displayedMaterials.map((mat, idx) => {
                  const isChecked = selectedMaterials.includes(mat);
                  const count = products.filter(p => (p.subcategory || p.description || "").toLowerCase().includes(mat.toLowerCase())).length;
                  return (
                    <label key={idx} className="ref-radio-row" onClick={() => handleMaterialChange(mat)}>
                      <div className="ref-radio-label-left">
                        <span className={`ref-radio-circle ${isChecked ? "selected" : ""}`}></span>
                        <span>{mat}</span>
                      </div>
                      <span className="ref-radio-count">({count})</span>
                    </label>
                  );
                })}
              </div>

              {materialsList.length > 5 && (
                <button 
                  className="ref-show-more-btn" 
                  onClick={() => setShowMoreMaterials(!showMoreMaterials)}
                  type="button"
                >
                  <span className="ref-radio-circle"></span>
                  Show {showMoreMaterials ? "Less" : "More"}
                </button>
              )}
            </div>
          )}
        </div>

        {isModal && (
          <div style={{ marginTop: "24px" }}>
            <button 
              className="btn-primary" 
              onClick={() => setIsFilterDrawerOpen(false)} 
              style={{ width: "100%", padding: "14px", fontWeight: "700", letterSpacing: "0.1em" }}
              type="button"
            >
              APPLY FILTERS {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Slide-Over Filter Drawer Modal (Mobile / Tablet) */}
      <div className={`filter-drawer-overlay ${isFilterDrawerOpen ? "open" : ""}`} onClick={() => setIsFilterDrawerOpen(false)}>
        <div className="filter-drawer-panel" onClick={(e) => e.stopPropagation()}>
          {renderFilterPanelContent(true)}
        </div>
      </div>

      {/* Collection Hero Header matching Reference Image 1 */}
      <header className="catalog-hero" style={getBannerStyle()}>
        {collection?.bannerImage && !collection.bannerImage.match(/\.(mp4|webm|ogg)(\?.*)?$/i) ? (
          <img 
            src={collection.bannerImage} 
            alt={displayTitle} 
            style={getMediaStyle()}
          />
        ) : collection?.bannerImage ? (
          <video 
            src={collection.bannerImage} 
            autoPlay 
            loop 
            muted 
            playsInline 
            style={getMediaStyle()} 
          />
        ) : null}
        <div className="hero-overlay" style={{ zIndex: 1 }}></div>
        <motion.div 
          className="hero-content" 
          style={{ position: "relative", zIndex: 2, textAlign: "center" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: customEase }}
        >
          <h1 className="hero-title" style={{ textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>{displayTitle}</h1>
          <p className="hero-subtitle" style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.2em", color: "var(--color-secondary)" }}>
            HOME • {displayTitle.toUpperCase()}
          </p>
        </motion.div>
      </header>

      {/* Dynamic Category Pill Navigation */}
      <div className="container" style={{ padding: "24px 16px 0 16px" }}>
        <style dangerouslySetInnerHTML={{__html: `
          .category-pill-nav::-webkit-scrollbar { display: none; }
          .category-pill-nav { -ms-overflow-style: none; scrollbar-width: none; }
          .category-pill {
            padding: 10px 24px;
            border-radius: 100px;
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
            text-decoration: none;
            transition: all 0.2s ease;
            text-transform: capitalize;
          }
          .category-pill:hover {
            opacity: 0.8;
          }
        `}} />
        <div className="category-pill-nav" style={{
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          paddingBottom: "8px",
          WebkitOverflowScrolling: "touch"
        }}>
          <Link 
            href="/all"
            className="category-pill"
            style={{
              border: (decodedSlug === "all" || decodedSlug === "search") ? "1px solid var(--color-primary)" : "1px solid var(--color-outline-variant)",
              backgroundColor: (decodedSlug === "all" || decodedSlug === "search") ? "var(--color-primary)" : "transparent",
              color: (decodedSlug === "all" || decodedSlug === "search") ? "#ffffff" : "var(--color-on-surface)"
            }}
          >
            All
          </Link>

          {allCategories.map((cat, idx) => {
            const isActive = decodeURIComponent(slug).toLowerCase().trim() === (cat.slug || "").toLowerCase().trim();
            return (
              <Link
                key={idx}
                href={`/${cat.slug}`}
                className="category-pill"
                style={{
                  border: isActive ? "1px solid var(--color-primary)" : "1px solid var(--color-outline-variant)",
                  backgroundColor: isActive ? "var(--color-primary)" : "transparent",
                  color: isActive ? "#ffffff" : "var(--color-on-surface)"
                }}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Catalog In-Page Filter Layout & Grid */}
      <div className="container catalog-container" style={{ padding: "32px 16px" }}>
        <div className="in-page-catalog-flex">
          {/* Desktop In-Page Left Filter Column */}
          {showDesktopFilters && (
            <aside 
              className="in-page-filter-aside"
              style={{
                position: "sticky",
                top: "100px",
                height: "calc(100vh - 120px)",
                overflowY: "auto",
                alignSelf: "flex-start",
                scrollbarWidth: "thin",
                paddingRight: "12px",
                flexShrink: 0
              }}
            >
              {renderFilterPanelContent(false)}
            </aside>
          )}

          <div className="catalog-main-content" style={{ flex: showDesktopFilters ? undefined : "1 1 100%", width: showDesktopFilters ? undefined : "100%" }}>
            <div className="catalog-toolbar">
              <div className="toolbar-left" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <button 
                  className="filter-drawer-trigger universal-filter-toggle" 
                  onClick={() => {
                    if (window.innerWidth >= 1024) {
                      setShowDesktopFilters(!showDesktopFilters);
                    } else {
                      setIsFilterDrawerOpen(true);
                    }
                  }} 
                  type="button"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    border: "1px solid var(--color-primary)",
                    borderRadius: "100px",
                    backgroundColor: showDesktopFilters ? "var(--color-primary)" : "transparent",
                    color: showDesktopFilters ? "#ffffff" : "var(--color-primary)",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    {isMobileView ? "menu" : "tune"}
                  </span>
                  <span>
                    {isMobileView ? "FILTERS" : (showDesktopFilters ? "HIDE FILTERS" : "SHOW FILTERS")}
                  </span>
                  {activeFilterCount > 0 && (
                    <span style={{ 
                      backgroundColor: showDesktopFilters ? "var(--color-secondary)" : "var(--color-primary)", 
                      color: "#ffffff",
                      padding: "2px 8px",
                      borderRadius: "100px",
                      fontSize: "10px",
                      fontWeight: 800
                    }}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <p className="results-count" style={{ margin: 0, fontSize: "14px", color: "var(--color-on-surface-variant)", fontWeight: "500" }}>
                  Showing {filteredProducts.length} pieces
                </p>
              </div>

              <div className="toolbar-right">
                <div className="sort-select-wrap">
                  <label htmlFor="sort-by">Sort By:</label>
                  <select 
                    id="sort-by"
                    className="sort-dropdown"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="price-desc">Price: High to Low</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="recommended">Recommended</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="rating-desc">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--color-on-surface-variant)", width: "100%" }}>
                Loading {displayTitle} collection...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px", background: "var(--color-surface)", borderRadius: "16px", border: "1px dashed var(--color-outline-variant)", margin: "32px 0", width: "100%" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "56px", marginBottom: "16px", color: "var(--color-primary)", opacity: 0.6 }}>diamond</span>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "var(--color-on-surface)", margin: "0 0 8px 0" }}>No Exclusive Pieces Found</h3>
                <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", maxWidth: "420px", margin: "0 auto", lineHeight: 1.6 }}>
                  There are currently no jewelry pieces assigned to the <strong>{displayTitle}</strong> category. Please check back soon or explore our other handcrafted collections.
                </p>
              </div>
            ) : (
              <motion.div 
                className="products-grid"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <motion.div 
                      key={product.id} 
                      variants={fadeInUp}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      style={{ display: "flex", flexDirection: "column", height: "100%" }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
