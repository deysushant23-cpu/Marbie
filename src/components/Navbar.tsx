"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { count, setShowAuthModal, logoutCustomer } = useCart();
  const { data: session } = useSession();

  const [config, setConfig] = useState<any>(null);
  const [collectionsList, setCollectionsList] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((err) => console.error("Failed to load navbar config", err));

    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => setCollectionsList(Array.isArray(data) ? data : []))
      .catch(() => {});

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const delayDebounceFn = setTimeout(() => {
        fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setSearchResults(data.slice(0, 5));
            }
          })
          .catch(() => {});
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);



  const allCategories = (config?.categories && config.categories.length > 0)
    ? config.categories.map((c: any) => ({ name: c.name, href: `/${c.slug}` }))
    : collectionsList.length > 0
      ? collectionsList.map((c: any) => ({ name: c.title?.trim() || c.slug, href: `/${c.slug}` }))
      : [
          { name: "Bracelets", href: "/bracelets" },
          { name: "Necklaces", href: "/necklaces" },
          { name: "Korean Jewelry", href: "/korean" },
          { name: "Bridal", href: "/bridal" },
        ];

  const headerLinks = allCategories.slice(0, 4);

  return (
    <>


      {/* Stitch Luxury Navigation Bar */}
      <motion.nav 
        initial={{ y: -80 }} 
        animate={{ y: 0 }} 
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`navbar ${isScrolled ? "scrolled" : ""}`} 
        id="main-nav"
      >
        <div className="container nav-inner">
          {/* Brand Logo (Marbie Jewels 34px Typography) */}
          <Link href="/" className="logo hover-scale" style={{ display: "flex", alignItems: "center", textDecoration: "none", fontFamily: "var(--font-display)", fontSize: "34px", fontWeight: "700", letterSpacing: "0.03em", color: "var(--color-primary)" }}>
            {config?.footer?.brandName || "Marbie Jewels"}
          </Link>

          {/* Desktop Links (Top 4 Categories Only) */}
          <div className="nav-links">
            {headerLinks.map((item: any) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link key={item.name} href={item.href} className={`nav-link ${isActive ? "active" : ""}`} style={{ transition: "color 0.25s ease" }}>
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Trailing Actions */}
          <div className="nav-actions">
            {/* Live Search Bar */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <AnimatePresence mode="wait">
                {!isSearchOpen ? (
                  <motion.button
                    key="search-icon"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="icon-btn hover-scale"
                    onClick={() => setIsSearchOpen(true)}
                    aria-label="Search"
                    title="Search"
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}
                  >
                    <span className="material-symbols-outlined">search</span>
                  </motion.button>
                ) : (
                  <motion.form
                    key="search-form"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "240px", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (searchQuery.trim()) {
                        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                        setSearchQuery("");
                        setIsSearchOpen(false);
                      }
                    }}
                    className="search-bar"
                    style={{ overflow: "hidden", display: "flex", alignItems: "center", whiteSpace: "nowrap", margin: 0 }}
                  >
                    <span 
                      className="material-symbols-outlined" 
                      style={{ fontSize: "20px", color: "var(--color-on-surface-variant)", cursor: "pointer" }} 
                      onClick={() => { if (!searchQuery) setIsSearchOpen(false); }}
                    >
                      search
                    </span>
                    <input
                      className="search-input"
                      placeholder="Search catalog..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      onBlur={() => {
                        if (!searchQuery) setIsSearchOpen(false);
                      }}
                      style={{ width: "100%" }}
                    />
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchQuery.trim().length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }} 
                    transition={{ duration: 0.2 }}
                    style={{ position: "absolute", top: "100%", right: 0, width: "300px", background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-lg)", padding: "12px", boxShadow: "0 12px 32px rgba(0,36,27,0.1)", marginTop: "12px", zIndex: 100 }}
                  >
                    {searchResults.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", color: "var(--color-secondary)" }}>MATCHING PIECES</div>
                        {searchResults.map((p) => (
                          <Link key={p.id} href={`/product/${p.id}`} className="hover-scale" style={{ display: "flex", gap: "12px", alignItems: "center", textDecoration: "none", color: "var(--color-on-surface)" }} onClick={() => setSearchQuery("")}>
                            <Image src={p.image} alt={p.name} width={40} height={40} style={{ objectFit: "cover", borderRadius: "4px" }} quality={90} />
                            <div>
                              <div style={{ fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-display)" }}>{p.name}</div>
                              <div style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: 500 }}>₹{p.price}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: "13px", color: "var(--color-on-surface-variant)", padding: "8px 0" }}>No royal suites found for &quot;{searchQuery}&quot;.</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist Button */}
            <Link href="/wishlist" className="icon-btn hover-scale" aria-label="Wishlist" title="Wishlist">
              <span className="material-symbols-outlined">favorite</span>
            </Link>

            {/* Shopping Cart Button */}
            <Link href="/cart" className="icon-btn hover-scale" aria-label="Shopping Cart" title="Shopping Bag">
              <span className="material-symbols-outlined">shopping_bag</span>
              {count > 0 && (
                <motion.span 
                  key={count} 
                  initial={{ scale: 0.4 }} 
                  animate={{ scale: 1 }} 
                  transition={{ type: "spring", stiffness: 400, damping: 15 }} 
                  className="cart-badge"
                >
                  {count}
                </motion.span>
              )}
            </Link>

            {/* Account Trigger */}
            <div style={{ position: "relative" }}>
              <button 
                className="icon-btn hover-scale" 
                onClick={() => {
                  if (session?.user) {
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                  } else {
                    setShowAuthModal(true);
                  }
                }} 
                aria-label="Account" 
                title={session?.user ? "My Account" : "Sign In / Register"}
              >
                {session?.user ? (
                  session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "User"} 
                      style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>
                      {session.user.name ? session.user.name.charAt(0).toUpperCase() : "M"}
                    </div>
                  )
                ) : (
                  <span className="material-symbols-outlined">person</span>
                )}
              </button>

              {/* Profile Popup Menu */}
              <AnimatePresence>
                {isProfileMenuOpen && session?.user && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setIsProfileMenuOpen(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: -10, scale: 0.95 }} 
                      transition={{ duration: 0.2 }}
                      style={{ position: "absolute", top: "100%", right: 0, width: "240px", background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-lg)", padding: "16px", boxShadow: "0 12px 32px rgba(0,36,27,0.1)", marginTop: "12px", zIndex: 100, display: "flex", flexDirection: "column", gap: "12px" }}
                    >
                      <div style={{ paddingBottom: "12px", borderBottom: "1px solid var(--color-outline-variant)" }}>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-on-surface)" }}>{session.user.name || "Customer"}</div>
                        <div style={{ fontSize: "12px", color: "var(--color-on-surface-variant)" }}>{session.user.email}</div>
                      </div>
                      
                      <Link href="/profile" onClick={() => setIsProfileMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "var(--color-on-surface)", fontSize: "14px", padding: "4px 0" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>dashboard</span>
                        Account Dashboard
                      </Link>
                      <Link href="/wishlist" onClick={() => setIsProfileMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "var(--color-on-surface)", fontSize: "14px", padding: "4px 0" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>favorite</span>
                        Saved Trousseau
                      </Link>
                      
                      <button 
                        onClick={() => { setIsProfileMenuOpen(false); logoutCustomer(); signOut({ callbackUrl: "/" }); }} 
                        style={{ display: "flex", alignItems: "center", gap: "8px", border: "none", background: "none", color: "#ba1a1a", fontSize: "14px", padding: "12px 0 0 0", cursor: "pointer", borderTop: "1px solid var(--color-outline-variant)", width: "100%", textAlign: "left", fontWeight: 500 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Hamburger Trigger */}
            <button className="icon-btn hover-scale" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open Navigation Menu" title="All Categories & Navigation">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Overlay Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="mobile-menu-backdrop" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }} 
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="mobile-menu-overlay active" 
            style={{ overflowY: "auto", zIndex: 999 }}
          >
            <div className="mobile-menu-header" style={{ marginBottom: "32px", borderBottom: "1px solid var(--color-outline-variant)", paddingBottom: "16px" }}>
              <Link href="/" className="logo" style={{ fontSize: "28px", fontFamily: "var(--font-display)", fontWeight: "700" }} onClick={() => setIsMobileMenuOpen(false)}>
                {config?.footer?.brandName || "Marbie Jewels"}
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ color: "var(--color-on-surface)" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mobile-menu-links" style={{ gap: "24px" }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", color: "var(--color-secondary)", marginBottom: "12px", textTransform: "uppercase" }}>
                  ALL CATEGORIES & CATALOG
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <Link href="/" className="mobile-menu-link" style={{ fontSize: "16px", border: "none", padding: 0 }} onClick={() => setIsMobileMenuOpen(false)}>Home Page</Link>
                  {allCategories.map((item: any) => (
                    <Link key={item.name} href={item.href} className="mobile-menu-link" style={{ fontSize: "16px", border: "none", padding: 0 }} onClick={() => setIsMobileMenuOpen(false)}>
                      {item.name}
                    </Link>
                  ))}
                  <Link href="/lookbook" className="mobile-menu-link" style={{ fontSize: "16px", border: "none", padding: 0 }} onClick={() => setIsMobileMenuOpen(false)}>Editorial Lookbook</Link>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--color-outline-variant)", paddingTop: "20px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", color: "var(--color-secondary)", marginBottom: "12px", textTransform: "uppercase" }}>
                  CONCIERGE & SUPPORT
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <Link href="/wishlist" className="mobile-menu-link" style={{ fontSize: "16px", border: "none", padding: 0 }} onClick={() => setIsMobileMenuOpen(false)}>My Wishlist</Link>
                  <Link href="/cart" className="mobile-menu-link" style={{ fontSize: "16px", border: "none", padding: 0 }} onClick={() => setIsMobileMenuOpen(false)}>Shopping Bag ({count})</Link>
                  <Link href="/history" className="mobile-menu-link" style={{ fontSize: "16px", border: "none", padding: 0 }} onClick={() => setIsMobileMenuOpen(false)}>Order History</Link>
                  <Link href="/track-order" className="mobile-menu-link" style={{ fontSize: "16px", border: "none", padding: 0 }} onClick={() => setIsMobileMenuOpen(false)}>Track Order Status</Link>
                  <Link href="/info/about-us" className="mobile-menu-link" style={{ fontSize: "16px", border: "none", padding: 0 }} onClick={() => setIsMobileMenuOpen(false)}>About Our Heritage</Link>
                </div>
              </div>
            </div>

            <div className="mobile-menu-footer" style={{ marginTop: "32px", borderTop: "1px solid var(--color-outline-variant)", paddingTop: "24px" }}>
              {session?.user ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ color: "var(--color-on-surface)", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "14px" }}>
                    <span className="material-symbols-outlined">dashboard</span>
                    My Account Dashboard
                  </Link>
                  <button style={{ color: "#ba1a1a", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "14px" }} onClick={() => { setIsMobileMenuOpen(false); logoutCustomer(); signOut({ callbackUrl: "/" }); }}>
                    <span className="material-symbols-outlined">logout</span>
                    Sign Out
                  </button>
                </div>
              ) : (
                <button style={{ color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "14px" }} onClick={() => { setIsMobileMenuOpen(false); setShowAuthModal(true); }}>
                  <span className="material-symbols-outlined">person</span>
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
