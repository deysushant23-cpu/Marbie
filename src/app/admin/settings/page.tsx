"use client";

import React, { useState, useEffect } from "react";
import ImageUpload from "@/components/admin/ImageUpload";

export default function AdminSettings() {
  const [config, setConfig] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/config").then(res => res.json()),
      fetch("/api/products").then(res => res.json())
    ])
      .then(([configData, productsData]) => {
        // Initialize featuredProductIds if missing
        if (!configData.featuredProductIds) {
          configData.featuredProductIds = ["", "", "", ""];
        } else while (configData.featuredProductIds.length < 4) {
          configData.featuredProductIds.push("");
        }
        if (!configData.marketing) configData.marketing = {};
        if (!configData.marketing.offers) {
          configData.marketing.offers = [
            { id: "offer-1", title: "Summer Trend Drop", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCiszRq5LNv5_06qoHu5y0glWLWVdZFWWnWug4_HzcsHjoNfQiGjnoIRv2HQRRXCRJxfJobyX7XVZ6u__BigftYGOz27MY2TV6pOX3hlObr4wgmqEQoC7ornVSjWZUqsI22odDzbZ6dtUW3q490DzPW9J17JV7Imao5L1RYU9y95U0JhVZCc9IEE3Z269ViUUNDWxJXSG_s-4BkljJQZjgma1iziyNTp83HvT6naXjn5oFPxTbVmmjnCNXLdTJn6_8sM25V_sV661g", link: "/necklaces" },
            { id: "offer-2", title: "Royal Kundan Steals", image: "/images/lookbook_hero.png", link: "/bracelets" }
          ];
        }
        
        setConfig(configData);
        setProducts(productsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load config:", err);
        setLoading(false);
      });
  }, []);

  const autoSaveMaterials = async (newMaterials: string[]) => {
    const updatedConfig = { ...config, materials: newMaterials };
    setConfig(updatedConfig);
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig),
      });
    } catch (err) {
      console.error("Auto-save failed");
    }
  };

  const autoSaveProductCategories = async (newCategories: string[]) => {
    const updatedConfig = { ...config, productCategories: newCategories };
    setConfig(updatedConfig);
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig),
      });
    } catch (err) {
      console.error("Auto-save failed");
    }
  };

  const autoSaveColors = async (newColors: {name: string, hex: string}[]) => {
    const updatedConfig = { ...config, colors: newColors };
    setConfig(updatedConfig);
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig),
      });
    } catch (err) {
      console.error("Auto-save failed");
    }
  };

  const [newGlobalColorName, setNewGlobalColorName] = useState("");
  const [newGlobalColorHex, setNewGlobalColorHex] = useState("#000000");

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (err) {
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return <div style={{ padding: "64px", textAlign: "center" }}>Loading settings...</div>;
  }

  return (
    <div style={{ paddingBottom: "64px" }}>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Global Settings</h1>
          <p className="admin-subtitle">Manage storefront text, brand information, and global configurations.</p>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: "12px 24px" }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginTop: "32px" }}>

        {/* Global Page Banners */}
        <section className="dashboard-card" style={{ padding: "32px", gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", marginBottom: "24px" }}>
            Global Page Banners
          </h2>
          <div className="form-group" style={{ maxWidth: "600px" }}>
            <label className="form-label" style={{ marginBottom: "16px", display: "block" }}>All Products / Search Page Banner</label>
            
            <div style={{ width: "100%", height: "200px", backgroundColor: "var(--color-surface-container)", borderRadius: "12px", overflow: "hidden", marginBottom: "16px", border: "1px dashed var(--color-outline-variant)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {config.storefront?.allProductsBanner ? (
                <img src={config.storefront.allProductsBanner} alt="All Products Banner Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "var(--color-on-surface-variant)", fontSize: "14px" }}>No Banner Set</span>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <ImageUpload 
                buttonText="Upload New Banner Image"
                folder="marbie-bridal/banners"
                onUploadSuccess={(url) => setConfig({ 
                  ...config, 
                  storefront: { ...config.storefront, allProductsBanner: url } 
                })} 
              />
              {config.storefront?.allProductsBanner && (
                <button 
                  type="button" 
                  style={{ background: "none", border: "none", color: "var(--color-error)", cursor: "pointer", fontSize: "13px", fontWeight: "600", textDecoration: "underline" }}
                  onClick={() => setConfig({ ...config, storefront: { ...config.storefront, allProductsBanner: "" } })}
                >
                  Remove Banner
                </button>
              )}
            </div>

            <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", marginTop: "12px" }}>
              Upload an image to serve as the hero background on the /search (All Products) page.
            </p>
          </div>
        </section>
        
        {/* SEO Meta Settings */}
        <section className="dashboard-card" style={{ padding: "32px", gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", marginBottom: "24px" }}>
            SEO & Meta Keywords
          </h2>
          <div className="form-group">
            <label className="form-label">Search Keywords (Comma Separated)</label>
            <textarea 
              className="form-input" 
              style={{ minHeight: "80px", resize: "vertical" }}
              value={config.storefront?.seoKeywords || ""}
              onChange={(e) => setConfig({ 
                ...config, 
                storefront: { ...config.storefront, seoKeywords: e.target.value } 
              })}
              placeholder="e.g. jewelry, kundan necklace, marbie jewels, bridal set"
            />
            <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", marginTop: "12px" }}>
              These keywords will be injected into the website's HTML &lt;head&gt; to help search engines understand and recommend your website.
            </p>
          </div>
        </section>

        {/* Footer & Brand Settings */}
        <section className="dashboard-card" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", marginBottom: "24px" }}>
            Brand & Footer
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="form-group">
              <label className="form-label">Brand Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={config.footer?.brandName || ""}
                onChange={(e) => setConfig({ ...config, footer: { ...config.footer, brandName: e.target.value } })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Footer Description</label>
              <textarea 
                className="form-input" 
                style={{ minHeight: "100px", resize: "vertical" }}
                value={config.footer?.description || ""}
                onChange={(e) => setConfig({ ...config, footer: { ...config.footer, description: e.target.value } })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Copyright Text</label>
              <input 
                type="text" 
                className="form-input" 
                value={config.footer?.copyright || ""}
                onChange={(e) => setConfig({ ...config, footer: { ...config.footer, copyright: e.target.value } })}
              />
            </div>
          </div>
        </section>

        {/* Marketing Hero Settings */}
        <section className="dashboard-card" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", marginBottom: "24px" }}>
            Homepage Marketing (Hero)
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="form-group">
              <label className="form-label">Hero Title</label>
              <textarea 
                className="form-input" 
                style={{ minHeight: "80px", resize: "vertical" }}
                value={config.marketing?.hero?.title || ""}
                onChange={(e) => setConfig({ 
                  ...config, 
                  marketing: { ...config.marketing, hero: { ...config.marketing.hero, title: e.target.value } } 
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hero Subtitle</label>
              <input 
                type="text" 
                className="form-input" 
                value={config.marketing?.hero?.subtitle || ""}
                onChange={(e) => setConfig({ 
                  ...config, 
                  marketing: { ...config.marketing, hero: { ...config.marketing.hero, subtitle: e.target.value } } 
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hero Description</label>
              <textarea 
                className="form-input" 
                style={{ minHeight: "80px", resize: "vertical" }}
                value={config.marketing?.hero?.description || ""}
                onChange={(e) => setConfig({ 
                  ...config, 
                  marketing: { ...config.marketing, hero: { ...config.marketing.hero, description: e.target.value } } 
                })}
              />
            </div>
          </div>
        </section>

        {/* Promise Section */}
        <section className="dashboard-card" style={{ padding: "32px", gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", marginBottom: "24px" }}>
            Brand Promise Section
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="form-group">
              <label className="form-label">Promise Title</label>
              <input 
                type="text" 
                className="form-input" 
                value={config.marketing?.promise?.title || ""}
                onChange={(e) => setConfig({ 
                  ...config, 
                  marketing: { ...config.marketing, promise: { ...config.marketing.promise, title: e.target.value } } 
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Promise Label</label>
              <input 
                type="text" 
                className="form-input" 
                value={config.marketing?.promise?.label || ""}
                onChange={(e) => setConfig({ 
                  ...config, 
                  marketing: { ...config.marketing, promise: { ...config.marketing.promise, label: e.target.value } } 
                })}
              />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Promise Image URL</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input 
                  type="text" 
                  className="form-input" 
                  value={config.marketing?.promise?.image || ""}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    marketing: { ...config.marketing, promise: { ...config.marketing.promise, image: e.target.value } } 
                  })}
                  style={{ flex: 1 }}
                />
                <ImageUpload 
                  onUploadSuccess={(url) => setConfig({ 
                    ...config, 
                    marketing: { ...config.marketing, promise: { ...config.marketing.promise, image: url } } 
                  })} 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured New Arrivals */}
        <section className="dashboard-card" style={{ padding: "32px", gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", marginBottom: "24px" }}>
            Featured New Arrivals
          </h2>
          <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", marginBottom: "24px" }}>
            Select exactly 4 products to feature on the homepage. If left empty, the storefront will automatically pick the first 4 products in your catalog.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="form-group">
                <label className="form-label">Featured Product {index + 1}</label>
                <select
                  className="form-input"
                  value={config.featuredProductIds?.[index] || ""}
                  onChange={(e) => {
                    const newIds = [...(config.featuredProductIds || ["", "", "", ""])];
                    newIds[index] = e.target.value;
                    setConfig({ ...config, featuredProductIds: newIds });
                  }}
                >
                  <option value="">-- Auto select --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* Homepage Hero Carousel Ratio */}
        <section className="dashboard-card" style={{ padding: "32px", gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", marginBottom: "24px" }}>
            Homepage Hero Carousel Ratio & Fit
          </h2>
          <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", marginBottom: "24px" }}>
            Choose the display height and image cropping style for the main hero slider on your storefront homepage.
          </p>
          <div className="form-group" style={{ maxWidth: "400px" }}>
            <label className="form-label">Carousel Aspect Ratio / Display Mode</label>
            <select
              className="form-input"
              value={config.heroCarouselRatio || "default"}
              onChange={(e) => setConfig({ ...config, heroCarouselRatio: e.target.value })}
            >
              <option value="default">Default / Tall (Luxury ~800px)</option>
              <option value="cinematic">Cinematic Widescreen (16:9 ~500px)</option>
              <option value="compact">Compact Banner (~350px)</option>
              <option value="contain">Auto Fit / Contain (Show Entire Image without Cropping)</option>
            </select>
          </div>
        </section>

        {/* Announcement Marquee Ticker Editor */}
        <section className="dashboard-card" style={{ padding: "32px", gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", margin: 0 }}>
              Announcement Marquee Running Ticker
            </h2>
            <button 
              onClick={async () => {
                setSaving(true);
                try {
                  await fetch("/api/config", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(config),
                  });
                  alert("Running Ticker settings updated!");
                } catch(e) { console.error(e); }
                setSaving(false);
              }}
              className="btn-primary"
              style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 700 }}
              type="button"
            >
              {saving ? "SAVING..." : "SAVE TICKER STRIP"}
            </button>
          </div>

          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label className="form-label">Running Ticker Strip Text</label>
            <textarea 
              className="form-input" 
              style={{ minHeight: "80px", resize: "vertical", fontFamily: "monospace", fontSize: "13px" }}
              value={config.marketing?.marqueeText || ""}
              onChange={(e) => setConfig({ 
                ...config, 
                marketing: { ...config.marketing, marqueeText: e.target.value } 
              })}
              placeholder="✧ OVER 50,000+ ROYAL BRIDES STYLED GLOBALLY • TRUSTED BY TOP CELEBRITY STYLISTS ✧"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
            <div className="form-group">
              <label className="form-label">Click Destination URL Link</label>
              <input 
                type="text"
                className="form-input"
                value={config.marketing?.marqueeLink || "/lookbook"}
                onChange={(e) => setConfig({ 
                  ...config, 
                  marketing: { ...config.marketing, marqueeLink: e.target.value } 
                })}
                placeholder="/lookbook or /collections"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Background Color</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input 
                  type="color"
                  value={config.marketing?.marqueeBgColor?.startsWith("#") ? config.marketing.marqueeBgColor : "#00241b"}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    marketing: { ...config.marketing, marqueeBgColor: e.target.value } 
                  })}
                  style={{ width: "44px", height: "38px", padding: "2px", cursor: "pointer", border: "1px solid var(--color-outline)", borderRadius: "6px", background: "none" }}
                />
                <input 
                  type="text"
                  className="form-input"
                  value={config.marketing?.marqueeBgColor || "#00241b"}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    marketing: { ...config.marketing, marqueeBgColor: e.target.value } 
                  })}
                  placeholder="#00241b"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Text Color</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input 
                  type="color"
                  value={config.marketing?.marqueeTextColor?.startsWith("#") ? config.marketing.marqueeTextColor : "#fed65b"}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    marketing: { ...config.marketing, marqueeTextColor: e.target.value } 
                  })}
                  style={{ width: "44px", height: "38px", padding: "2px", cursor: "pointer", border: "1px solid var(--color-outline)", borderRadius: "6px", background: "none" }}
                />
                <input 
                  type="text"
                  className="form-input"
                  value={config.marketing?.marqueeTextColor || "#fed65b"}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    marketing: { ...config.marketing, marqueeTextColor: e.target.value } 
                  })}
                  placeholder="#fed65b"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Homepage Promotional Offers Banners Manager */}
        <section className="dashboard-card" style={{ padding: "32px", gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", margin: "0 0 4px 0" }}>
                Homepage Promotional Offer Banners
              </h2>
              <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant)", margin: 0 }}>
                Manage promotional banners and destination category click links on your storefront homepage.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                onClick={() => {
                  const newOffer = {
                    id: `offer-${Date.now()}`,
                    title: "New Promotional Offer",
                    image: "/images/lookbook_hero.png",
                    link: "/necklaces"
                  };
                  setConfig({
                    ...config,
                    marketing: {
                      ...config.marketing,
                      offers: [...(config.marketing?.offers || []), newOffer]
                    }
                  });
                }}
                className="btn-secondary"
                style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 700 }}
                type="button"
              >
                + ADD OFFER BANNER
              </button>
              <button 
                onClick={handleSave}
                className="btn-primary"
                style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 700 }}
                type="button"
              >
                {saving ? "SAVING..." : "SAVE OFFERS"}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ maxWidth: "400px", marginBottom: "28px" }}>
            <label className="form-label">Offers Section Title</label>
            <input 
              type="text"
              className="form-input"
              value={config.marketing?.offersTitle || "OFFERS"}
              onChange={(e) => setConfig({
                ...config,
                marketing: { ...config.marketing, offersTitle: e.target.value }
              })}
            />
          </div>

          <div className="form-group" style={{ maxWidth: "600px", marginBottom: "32px", padding: "20px", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline)", borderRadius: "12px" }}>
            <label className="form-label">Decorative Section Divider (Image/SVG)</label>
            <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", marginBottom: "16px", marginTop: "-4px" }}>
              Upload a beautiful transparent PNG or SVG to separate homepage sections. Leaves empty to use default text dividers.
            </p>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <input 
                type="text"
                className="form-input"
                value={config.marketing?.sectionDividerImage || ""}
                onChange={(e) => setConfig({
                  ...config,
                  marketing: { ...config.marketing, sectionDividerImage: e.target.value }
                })}
                placeholder="e.g. /images/divider.png"
                style={{ flex: 1 }}
              />
              <ImageUpload 
                onUploadSuccess={(url) => {
                  setConfig({
                    ...config,
                    marketing: { ...config.marketing, sectionDividerImage: url }
                  });
                }}
              />
            </div>
            {config.marketing?.sectionDividerImage && (
              <div style={{ marginTop: "16px", padding: "16px", backgroundColor: "var(--color-surface-container)", borderRadius: "8px", display: "flex", justifyContent: "center" }}>
                <img src={config.marketing.sectionDividerImage} alt="Divider Preview" style={{ maxHeight: "30px", objectFit: "contain" }} />
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {(config.marketing?.offers || []).map((offer: any, idx: number) => (
              <div key={offer.id || idx} style={{ padding: "20px", border: "1px solid var(--color-outline)", borderRadius: "12px", backgroundColor: "var(--color-surface)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-primary)" }}>Banner #{idx + 1}</span>
                  <button 
                    onClick={() => {
                      const updated = (config.marketing?.offers || []).filter((_: any, i: number) => i !== idx);
                      setConfig({
                        ...config,
                        marketing: { ...config.marketing, offers: updated }
                      });
                    }}
                    style={{ background: "none", border: "none", color: "var(--color-error)", cursor: "pointer", fontSize: "18px", fontWeight: 800 }}
                    title="Remove Banner"
                    type="button"
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div className="form-group">
                    <label className="form-label">Internal Note / Campaign Name</label>
                    <input 
                      type="text"
                      className="form-input"
                      value={offer.title || ""}
                      onChange={(e) => {
                        const list = [...(config.marketing?.offers || [])];
                        list[idx] = { ...list[idx], title: e.target.value };
                        setConfig({ ...config, marketing: { ...config.marketing, offers: list } });
                      }}
                      placeholder="Summer Drop"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Click Destination Category URL</label>
                    <input 
                      type="text"
                      className="form-input"
                      value={offer.link || ""}
                      onChange={(e) => {
                        const list = [...(config.marketing?.offers || [])];
                        list[idx] = { ...list[idx], link: e.target.value };
                        setConfig({ ...config, marketing: { ...config.marketing, offers: list } });
                      }}
                      placeholder="/bracelets or /necklaces"
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Banner Image URL & Upload</label>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input 
                        type="text"
                        className="form-input"
                        value={offer.image || ""}
                        onChange={(e) => {
                          const list = [...(config.marketing?.offers || [])];
                          list[idx] = { ...list[idx], image: e.target.value };
                          setConfig({ ...config, marketing: { ...config.marketing, offers: list } });
                        }}
                        style={{ flex: 1 }}
                      />
                      <ImageUpload 
                        onUploadSuccess={(url) => {
                          const list = [...(config.marketing?.offers || [])];
                          list[idx] = { ...list[idx], image: url };
                          setConfig({ ...config, marketing: { ...config.marketing, offers: list } });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Storefront Section Headings & Subtitles Manager */}
        <section className="dashboard-card" style={{ padding: "32px", gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", marginBottom: "24px" }}>
            Storefront Section Headings & Titles
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="form-group">
              <label className="form-label">Category Strip Title</label>
              <input 
                type="text" 
                className="form-input" 
                value={config.labels?.categorySection?.title || "SHOP BY CATEGORY"}
                onChange={(e) => setConfig({ 
                  ...config, 
                  labels: { ...config.labels, categorySection: { title: e.target.value } } 
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Reviews Title</label>
              <input 
                type="text" 
                className="form-input" 
                value={config.labels?.reviewsSection?.title || "REAL ROYAL BRIDES"}
                onChange={(e) => setConfig({ 
                  ...config, 
                  labels: { ...config.labels, reviewsSection: { title: e.target.value } } 
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Showcase 1 Heading (New Arrivals)</label>
              <input 
                type="text" 
                className="form-input" 
                value={config.labels?.arrivalsSection?.title || "Hot New Arrivals"}
                onChange={(e) => setConfig({ 
                  ...config, 
                  labels: { ...config.labels, arrivalsSection: { ...config.labels?.arrivalsSection, title: e.target.value } } 
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Showcase 1 Subtitle</label>
              <input 
                type="text" 
                className="form-input" 
                value={config.labels?.arrivalsSection?.subtitle || "Hand-selected pieces from our latest royal curation."}
                onChange={(e) => setConfig({ 
                  ...config, 
                  labels: { ...config.labels, arrivalsSection: { ...config.labels?.arrivalsSection, subtitle: e.target.value } } 
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Showcase 2 Heading (Best Sellers)</label>
              <input 
                type="text" 
                className="form-input" 
                value={config.labels?.bestSellersSection?.title || "Best Selling Suites"}
                onChange={(e) => setConfig({ 
                  ...config, 
                  labels: { ...config.labels, bestSellersSection: { ...config.labels?.bestSellersSection, title: e.target.value } } 
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Showcase 2 Subtitle</label>
              <input 
                type="text" 
                className="form-input" 
                value={config.labels?.bestSellersSection?.subtitle || "Our most coveted pieces loved by over 50,000+ brides."}
                onChange={(e) => setConfig({ 
                  ...config, 
                  labels: { ...config.labels, bestSellersSection: { ...config.labels?.bestSellersSection, subtitle: e.target.value } } 
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Showcase 3 Heading (Exclusive Steals)</label>
              <input 
                type="text" 
                className="form-input" 
                value={config.labels?.exclusiveStealsSection?.title || "Exclusive Bridal Steals"}
                onChange={(e) => setConfig({ 
                  ...config, 
                  labels: { ...config.labels, exclusiveStealsSection: { ...config.labels?.exclusiveStealsSection, title: e.target.value } } 
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Showcase 3 Subtitle</label>
              <input 
                type="text" 
                className="form-input" 
                value={config.labels?.exclusiveStealsSection?.subtitle || "Statement Kundan & Polki sets crafted for royalty."}
                onChange={(e) => setConfig({ 
                  ...config, 
                  labels: { ...config.labels, exclusiveStealsSection: { ...config.labels?.exclusiveStealsSection, subtitle: e.target.value } } 
                })}
              />
            </div>
          </div>
        </section>

        {/* USP Trust Footer Banner Editor */}
        <section className="dashboard-card" style={{ padding: "32px", gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", marginBottom: "24px" }}>
            USP Trust Footer Badges (4 Cards)
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {(config.marketing?.uspCards || [
              { title: "FREE EXPRESS SHIPPING", desc: "On all insured orders across India & Globe.", icon: "local_shipping" },
              { title: "LIFETIME PLATING WARRANTY", desc: "100% Gilded Gold & Kundan Craftsmanship.", icon: "verified_user" },
              { title: "100% SECURE CHECKOUT", desc: "Encrypted Online Payments & COD Available.", icon: "lock" },
              { title: "EASY CONCIERGE RETURNS", desc: "Hassle-free exchanges and bridal support.", icon: "published_with_changes" }
            ]).map((card: any, index: number) => (
              <div key={index} style={{ padding: "16px", border: "1px solid var(--color-outline-variant)", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ fontWeight: 700, fontSize: "12px", color: "var(--color-secondary)" }}>BADGE #{index + 1}</div>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={card.title || ""}
                    onChange={(e) => {
                      const newCards = [...(config.marketing?.uspCards || [
                        { title: "FREE EXPRESS SHIPPING", desc: "On all insured orders across India & Globe.", icon: "local_shipping" },
                        { title: "LIFETIME PLATING WARRANTY", desc: "100% Gilded Gold & Kundan Craftsmanship.", icon: "verified_user" },
                        { title: "100% SECURE CHECKOUT", desc: "Encrypted Online Payments & COD Available.", icon: "lock" },
                        { title: "EASY CONCIERGE RETURNS", desc: "Hassle-free exchanges and bridal support.", icon: "published_with_changes" }
                      ])];
                      newCards[index] = { ...newCards[index], title: e.target.value };
                      setConfig({ ...config, marketing: { ...config.marketing, uspCards: newCards } });
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={card.desc || ""}
                    onChange={(e) => {
                      const newCards = [...(config.marketing?.uspCards || [
                        { title: "FREE EXPRESS SHIPPING", desc: "On all insured orders across India & Globe.", icon: "local_shipping" },
                        { title: "LIFETIME PLATING WARRANTY", desc: "100% Gilded Gold & Kundan Craftsmanship.", icon: "verified_user" },
                        { title: "100% SECURE CHECKOUT", desc: "Encrypted Online Payments & COD Available.", icon: "lock" },
                        { title: "EASY CONCIERGE RETURNS", desc: "Hassle-free exchanges and bridal support.", icon: "published_with_changes" }
                      ])];
                      newCards[index] = { ...newCards[index], desc: e.target.value };
                      setConfig({ ...config, marketing: { ...config.marketing, uspCards: newCards } });
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Material Symbol Icon Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={card.icon || "verified"}
                    onChange={(e) => {
                      const newCards = [...(config.marketing?.uspCards || [
                        { title: "FREE EXPRESS SHIPPING", desc: "On all insured orders across India & Globe.", icon: "local_shipping" },
                        { title: "LIFETIME PLATING WARRANTY", desc: "100% Gilded Gold & Kundan Craftsmanship.", icon: "verified_user" },
                        { title: "100% SECURE CHECKOUT", desc: "Encrypted Online Payments & COD Available.", icon: "lock" },
                        { title: "EASY CONCIERGE RETURNS", desc: "Hassle-free exchanges and bridal support.", icon: "published_with_changes" }
                      ])];
                      newCards[index] = { ...newCards[index], icon: e.target.value };
                      setConfig({ ...config, marketing: { ...config.marketing, uspCards: newCards } });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Materials Settings */}
        <section className="dashboard-card" style={{ padding: "32px", gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", marginBottom: "24px" }}>
            Filter Materials
          </h2>
          <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", marginBottom: "24px" }}>
            These materials appear as filter options on the search and collection pages.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
            {config.materials?.map((material: string, index: number) => (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--color-surface-container)", padding: "8px 16px", borderRadius: "100px", border: "1px solid var(--color-outline-variant)" }}>
                <span style={{ fontSize: "14px", fontWeight: 500 }}>{material}</span>
                <button 
                  onClick={() => {
                    const newMaterials = [...config.materials];
                    newMaterials.splice(index, 1);
                    autoSaveMaterials(newMaterials);
                  }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "var(--color-on-surface-variant)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <input 
              type="text" 
              id="newMaterialInput"
              className="form-input" 
              placeholder="E.g., Rose Gold"
              style={{ maxWidth: "300px" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val && !config.materials?.includes(val)) {
                    autoSaveMaterials([...(config.materials || []), val]);
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }}
            />
            <button 
              className="btn-primary"
              onClick={() => {
                const inputEl = document.getElementById("newMaterialInput") as HTMLInputElement;
                const val = inputEl.value.trim();
                if (val && !config.materials?.includes(val)) {
                  autoSaveMaterials([...(config.materials || []), val]);
                  inputEl.value = "";
                }
              }}
              style={{ padding: "12px 24px", width: "auto" }}
            >
              Add Material
            </button>
          </div>
        </section>

        {/* Product Categories Settings */}
        <section className="dashboard-card" style={{ padding: "32px", gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", marginBottom: "24px" }}>
            Product Categories
          </h2>
          <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", marginBottom: "24px" }}>
            These categories appear as options when adding new products or defining collection filters.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
            {config.productCategories?.map((category: string, index: number) => (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--color-surface-container)", padding: "8px 16px", borderRadius: "100px", border: "1px solid var(--color-outline-variant)" }}>
                <span style={{ fontSize: "14px", fontWeight: 500 }}>{category}</span>
                <button 
                  onClick={() => {
                    const newCategories = [...config.productCategories];
                    newCategories.splice(index, 1);
                    autoSaveProductCategories(newCategories);
                  }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "var(--color-on-surface-variant)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <input 
              type="text" 
              id="newProductCategoryInput"
              className="form-input" 
              placeholder="E.g., Bangle"
              style={{ maxWidth: "300px" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val && !config.productCategories?.includes(val)) {
                    autoSaveProductCategories([...(config.productCategories || []), val]);
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }}
            />
            <button 
              className="btn-primary"
              onClick={() => {
                const inputEl = document.getElementById("newProductCategoryInput") as HTMLInputElement;
                const val = inputEl.value.trim();
                if (val && !config.productCategories?.includes(val)) {
                  autoSaveProductCategories([...(config.productCategories || []), val]);
                  inputEl.value = "";
                }
              }}
              style={{ padding: "12px 24px", width: "auto" }}
            >
              Add Category
            </button>
          </div>
        </section>

        {/* Colors Settings */}
        <section className="dashboard-card" style={{ padding: "32px", gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", marginBottom: "24px" }}>
            Filter Colors
          </h2>
          <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", marginBottom: "24px" }}>
            These colors appear as filter options on the search and collection pages. Define your global color palette here.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
            {config.colors?.map((color: {name: string, hex: string}, index: number) => (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--color-surface-container)", padding: "8px 16px", borderRadius: "100px", border: "1px solid var(--color-outline-variant)" }}>
                <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: color.hex, border: "1px solid rgba(0,0,0,0.1)" }}></div>
                <span style={{ fontSize: "14px", fontWeight: 500 }}>{color.name}</span>
                <button 
                  onClick={() => {
                    const newColors = [...config.colors];
                    newColors.splice(index, 1);
                    autoSaveColors(newColors);
                  }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "var(--color-on-surface-variant)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>COLOR NAME</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="E.g., Rose Gold"
                style={{ width: "200px" }}
                value={newGlobalColorName}
                onChange={(e) => setNewGlobalColorName(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>HEX CODE</label>
              <input 
                type="color" 
                style={{ width: "64px", height: "40px", cursor: "pointer", border: "1px solid rgba(115, 92, 0, 0.2)", padding: 0 }}
                value={newGlobalColorHex}
                onChange={(e) => setNewGlobalColorHex(e.target.value)}
              />
            </div>
            <button 
              className="btn-primary"
              onClick={() => {
                const name = newGlobalColorName.trim();
                if (name) {
                  const existingColors = config.colors || [];
                  if (!existingColors.some((c: any) => (c.name || "").toLowerCase() === name.toLowerCase())) {
                    autoSaveColors([...existingColors, { name, hex: newGlobalColorHex }]);
                    setNewGlobalColorName("");
                  } else {
                    alert("Color already exists.");
                  }
                } else {
                  alert("Please enter a color name.");
                }
              }}
              style={{ padding: "12px 24px", height: "40px" }}
            >
              Add Color
            </button>
          </div>
        </section>

        {/* Categories Settings */}
        <section className="dashboard-card" style={{ padding: "32px", gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", marginBottom: "24px" }}>
            Homepage Categories
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {config.categories?.map((cat: any, index: number) => (
              <div key={index} style={{ display: "flex", gap: "24px", alignItems: "center", borderBottom: "1px solid rgba(192, 200, 196, 0.2)", paddingBottom: "24px" }}>
                <div style={{ width: "120px", height: "120px", backgroundColor: "var(--color-surface-container)", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-on-surface-variant)", fontSize: "12px" }}>No Image</div>
                  )}
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Category Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={cat.name || ""}
                      onChange={(e) => {
                        const newCats = [...config.categories];
                        newCats[index].name = e.target.value;
                        setConfig({ ...config, categories: newCats });
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">URL Slug</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={cat.slug || ""}
                      onChange={(e) => {
                        const newCats = [...config.categories];
                        newCats[index].slug = e.target.value;
                        setConfig({ ...config, categories: newCats });
                      }}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Image URL</label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={cat.image || ""}
                        onChange={(e) => {
                          const newCats = [...config.categories];
                          newCats[index].image = e.target.value;
                          setConfig({ ...config, categories: newCats });
                        }}
                        style={{ flex: 1 }}
                      />
                      <ImageUpload 
                        folder="marbie-bridal/categories"
                        onUploadSuccess={(url) => {
                          const newCats = [...config.categories];
                          newCats[index].image = url;
                          setConfig({ ...config, categories: newCats });
                        }} 
                      />
                    </div>
                  </div>


                </div>
              </div>
            ))}
            
            <button
              className="btn-primary"
              onClick={() => {
                const newCats = [...(config.categories || [])];
                newCats.push({ name: "New Category", slug: "new-category", image: "" });
                setConfig({ ...config, categories: newCats });
              }}
              style={{ padding: "12px 24px", alignSelf: "flex-start" }}
            >
              Add Category
            </button>
          </div>
        </section>

        {/* Lookbook Settings */}
        <section className="dashboard-card" style={{ padding: "32px", gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", margin: 0 }}>
              Lookbook Layout
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--color-on-surface-variant)" }}>
                Display Style:
              </span>
              <select
                className="form-input"
                style={{ width: "auto" }}
                value={config.marketing?.lookbookStyle || "carousel"}
                onChange={(e) => setConfig({
                  ...config,
                  marketing: { ...config.marketing, lookbookStyle: e.target.value }
                })}
              >
                <option value="carousel">Horizontal Carousel</option>
                <option value="grid">Standard Grid</option>
              </select>
            </div>
          </div>
        </section>

        {/* Instagram Settings */}
        <section className="dashboard-card" style={{ padding: "32px", gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", margin: 0 }}>
              Instagram Feed
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--color-on-surface-variant)" }}>
                Feed Layout:
              </span>
              <select
                className="form-input"
                style={{ width: "auto" }}
                value={config.marketing?.instagramStyle || "square"}
                onChange={(e) => setConfig({
                  ...config,
                  marketing: { ...config.marketing, instagramStyle: e.target.value }
                })}
              >
                <option value="square">Square (1:1)</option>
                <option value="portrait">Portrait (9:16)</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {config.marketing?.instagram?.map((item: any, index: number) => (
              <div key={index} style={{ display: "flex", gap: "24px", alignItems: "center", borderBottom: "1px solid rgba(192, 200, 196, 0.2)", paddingBottom: "24px" }}>
                <div style={{ width: "120px", height: "120px", backgroundColor: "var(--color-surface-container)", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                  {item.type === "video" && item.url ? (
                    <video src={item.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted loop playsInline autoPlay />
                  ) : item.url ? (
                    <img src={item.url} alt="Instagram Media" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-on-surface-variant)", fontSize: "12px" }}>No Media</div>
                  )}
                </div>
                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-input"
                      value={item.type || "image"}
                      onChange={(e) => {
                        const newInsta = [...(config.marketing?.instagram || [])];
                        newInsta[index] = { ...newInsta[index], type: e.target.value };
                        setConfig({ ...config, marketing: { ...config.marketing, instagram: newInsta } });
                      }}
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Media URL / Upload</label>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={item.url || ""}
                        onChange={(e) => {
                          const newInsta = [...(config.marketing?.instagram || [])];
                          newInsta[index] = { ...newInsta[index], url: e.target.value };
                          setConfig({ ...config, marketing: { ...config.marketing, instagram: newInsta } });
                        }}
                      />
                      <ImageUpload 
                        onUploadSuccess={(url) => {
                          const newInsta = [...(config.marketing?.instagram || [])];
                          newInsta[index] = { ...newInsta[index], url: url };
                          setConfig({ ...config, marketing: { ...config.marketing, instagram: newInsta } });
                        }} 
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Linked Product (Shoppable)</label>
                    <select
                      className="form-input"
                      value={item.productId || ""}
                      onChange={(e) => {
                        const newInsta = [...(config.marketing?.instagram || [])];
                        newInsta[index] = { ...newInsta[index], productId: e.target.value };
                        setConfig({ ...config, marketing: { ...config.marketing, instagram: newInsta } });
                      }}
                    >
                      <option value="">-- None (Not Shoppable) --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--color-on-surface-variant)" }}>
                      Status:
                    </span>
                    <button
                      type="button"
                      style={{
                        padding: "8px 16px",
                        borderRadius: "100px",
                        border: "none",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                        backgroundColor: item.hidden ? "var(--color-surface-container-highest)" : "var(--color-primary)",
                        color: item.hidden ? "var(--color-on-surface)" : "var(--color-on-primary)",
                        transition: "all 0.2s"
                      }}
                      onClick={() => {
                        const newInsta = [...(config.marketing?.instagram || [])];
                        newInsta[index] = { ...newInsta[index], hidden: !newInsta[index].hidden };
                        setConfig({ ...config, marketing: { ...config.marketing, instagram: newInsta } });
                      }}
                    >
                      {item.hidden ? "Hidden" : "Visible"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            HOMEPAGE LAYOUT MANAGER
            ═══════════════════════════════════════════════════════════ */}
        <section className="dashboard-card" style={{ padding: "32px", gridColumn: "1 / -1" }}>
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", margin: "0 0 8px 0" }}>
              🏠 Homepage Layout Manager
            </h2>
            <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", margin: 0 }}>
              Show, hide, and reorder every section of your storefront homepage. Changes take effect immediately on Save.
            </p>
          </div>

          {/* Section Visibility Toggles */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
            {[
              { key: "showMarquee",         label: "Announcement Marquee Ticker",    icon: "campaign",       desc: "The scrolling text bar at the very top" },
              { key: "showHero",            label: "Hero Carousel (Slideshow)",       icon: "slideshow",      desc: "The fullscreen image/video banner" },
              { key: "showCategories",      label: "Shop by Category Grid",           icon: "grid_view",      desc: "3-column category cards section" },
              { key: "showOffers",          label: "Promotional Offers Banners",      icon: "local_offer",    desc: "Wide promotional image banners" },
              { key: "showNewArrivals",     label: "New Arrivals Products",           icon: "new_releases",   desc: "4-product grid of latest pieces" },
              { key: "showBestsellers",     label: "Best Sellers Products",           icon: "workspace_premium", desc: "4-product grid of best selling pieces" },
              { key: "showTrousseau",       label: "Royal Bridal Trousseau",          icon: "diamond",        desc: "Interactive occasion tabs with feature card" },
              { key: "showInstagram",       label: "Instagram Gallery Grid",          icon: "photo_library",  desc: "6-image social media grid" },
              { key: "showReviews",         label: "Customer Reviews Carousel",       icon: "star",           desc: "Scrolling review testimonials" },
            ].map((section) => {
              const isOn = config.marketing?.layout?.[section.key] !== false; // default ON
              return (
                <div
                  key={section.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px 20px",
                    borderRadius: "10px",
                    border: `1px solid ${isOn ? "var(--color-primary)" : "var(--color-outline-variant)"}`,
                    backgroundColor: isOn ? "rgba(0,36,27,0.04)" : "transparent",
                    transition: "all 0.2s ease",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    const layout = { ...(config.marketing?.layout || {}) };
                    layout[section.key] = !isOn;
                    setConfig({ ...config, marketing: { ...config.marketing, layout } });
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "22px", color: isOn ? "var(--color-primary)" : "var(--color-on-surface-variant)", flexShrink: 0 }}
                  >
                    {section.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-on-surface)" }}>{section.label}</div>
                    <div style={{ fontSize: "12px", color: "var(--color-on-surface-variant)" }}>{section.desc}</div>
                  </div>
                  {/* Toggle switch visual */}
                  <div style={{
                    width: "44px",
                    height: "24px",
                    borderRadius: "12px",
                    backgroundColor: isOn ? "var(--color-primary)" : "var(--color-outline-variant)",
                    position: "relative",
                    flexShrink: 0,
                    transition: "background-color 0.2s ease"
                  }}>
                    <div style={{
                      position: "absolute",
                      top: "3px",
                      left: isOn ? "23px" : "3px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      backgroundColor: "#fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                      transition: "left 0.2s ease"
                    }} />
                  </div>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: isOn ? "var(--color-primary)" : "var(--color-on-surface-variant)",
                    minWidth: "32px",
                    textAlign: "right"
                  }}>
                    {isOn ? "ON" : "OFF"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Section Order */}
          <div style={{ borderTop: "1px solid var(--color-outline-variant)", paddingTop: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-on-surface)", marginBottom: "8px" }}>Section Order</h3>
            <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant)", marginBottom: "16px" }}>
              Set the numeric display order (lower = appears first on the page). Sections with the same number appear in their default order.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {[
                { key: "orderMarquee",     label: "Announcement Marquee" },
                { key: "orderHero",        label: "Hero Carousel" },
                { key: "orderCategories",  label: "Shop by Category" },
                { key: "orderOffers",      label: "Promotional Offers" },
                { key: "orderArrivals",    label: "New Arrivals" },
                { key: "orderBestsellers", label: "Best Sellers" },
                { key: "orderTrousseau",   label: "Bridal Trousseau" },
                { key: "orderInstagram",   label: "Instagram Gallery" },
                { key: "orderReviews",     label: "Customer Reviews" },
              ].map((item, defaultIdx) => (
                <div key={item.key} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <label style={{ fontSize: "13px", color: "var(--color-on-surface-variant)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.label}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="form-input"
                    style={{ width: "64px", textAlign: "center", padding: "8px" }}
                    value={config.marketing?.layout?.[item.key] ?? (defaultIdx + 1)}
                    onChange={(e) => {
                      const layout = { ...(config.marketing?.layout || {}) };
                      layout[item.key] = parseInt(e.target.value) || (defaultIdx + 1);
                      setConfig({ ...config, marketing: { ...config.marketing, layout } });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Live Preview Summary */}
          <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "var(--color-surface-container)", borderRadius: "8px", border: "1px dashed var(--color-outline-variant)" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-primary)", marginBottom: "10px", textTransform: "uppercase" }}>
              📋 Active Sections Preview
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                { key: "showMarquee",     label: "Marquee",      orderKey: "orderMarquee",    defaultOrder: 1 },
                { key: "showHero",        label: "Hero",         orderKey: "orderHero",       defaultOrder: 2 },
                { key: "showCategories",  label: "Categories",   orderKey: "orderCategories", defaultOrder: 3 },
                { key: "showOffers",      label: "Offers",       orderKey: "orderOffers",     defaultOrder: 4 },
                { key: "showNewArrivals", label: "New Arrivals", orderKey: "orderArrivals",   defaultOrder: 5 },
                { key: "showBestsellers", label: "Best Sellers", orderKey: "orderBestsellers",defaultOrder: 5.5 },
                { key: "showTrousseau",   label: "Trousseau",    orderKey: "orderTrousseau",  defaultOrder: 6 },
                { key: "showInstagram",   label: "Instagram",    orderKey: "orderInstagram",  defaultOrder: 7 },
                { key: "showReviews",     label: "Reviews",      orderKey: "orderReviews",    defaultOrder: 8 },
              ]
                .filter(s => config.marketing?.layout?.[s.key] !== false)
                .sort((a, b) => (config.marketing?.layout?.[a.orderKey] ?? a.defaultOrder) - (config.marketing?.layout?.[b.orderKey] ?? b.defaultOrder))
                .map((s, i) => (
                  <div key={s.key} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 12px", backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                    <span style={{ opacity: 0.7 }}>{i + 1}.</span> {s.label}
                  </div>
                ))
              }
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
