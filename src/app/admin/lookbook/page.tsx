"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { isVideo } from "@/lib/media";
import ImageUpload from "@/components/admin/ImageUpload";

export default function AdminLookbookList() {
  const [items, setItems] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/lookbook").then(res => res.json()),
      fetch("/api/config").then(res => res.json())
    ])
      .then(([lookbookData, configData]) => {
        setItems(Array.isArray(lookbookData) ? lookbookData : []);
        setConfig(configData || {});
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const saveLookbookSettings = async () => {
    setSavingConfig(true);
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      alert("Lookbook Banner & Dynamic Ratio settings saved!");
    } catch(e) { console.error(e); }
    setSavingConfig(false);
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h2 className="page-title">Lookbook</h2>
          <p className="page-subtitle">Manage multi-media editorial campaigns & dynamic aspect ratios.</p>
        </div>
        <div className="header-actions">
          <Link href="/admin/lookbook/new" className="btn btn-primary" style={{ textDecoration: "none" }}>
            ADD NEW ENTRY
          </Link>
        </div>
      </header>

      {/* Lookbook Header Banner & Dynamic Ratio Manager */}
      {config && (
        <section className="card" style={{ padding: "28px", marginBottom: "32px", border: "1px solid var(--color-primary-container)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
                Lookbook Banner & Dynamic Aspect Ratio Settings
              </h3>
              <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", margin: "4px 0 0 0" }}>
                Customize header banner (image/video) and dynamic display aspect ratio for media grids.
              </p>
            </div>
            <button 
              onClick={saveLookbookSettings}
              className="btn-primary"
              style={{ padding: "10px 20px", fontSize: "12px", fontWeight: 700 }}
              type="button"
            >
              {savingConfig ? "SAVING..." : "SAVE LOOKBOOK CONFIG"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--color-on-surface)", marginBottom: "8px" }}>
                HEADER BANNER MEDIA URL (IMAGE OR VIDEO)
              </label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--color-outline)", borderRadius: "4px" }}
                  value={config.marketing?.lookbookBanner || ""} 
                  onChange={(e) => setConfig({
                    ...config,
                    marketing: { ...config.marketing, lookbookBanner: e.target.value }
                  })}
                  placeholder="/images/lookbook_hero.png or video.mp4"
                />
                <ImageUpload onUploadSuccess={(url) => setConfig({
                  ...config,
                  marketing: { ...config.marketing, lookbookBanner: url }
                })} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--color-on-surface)", marginBottom: "8px" }}>
                  BANNER ASPECT RATIO / MODE
                </label>
                <select 
                  className="search-input"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--color-outline)", borderRadius: "4px" }}
                  value={config.marketing?.lookbookBannerRatio || "default"}
                  onChange={(e) => setConfig({
                    ...config,
                    marketing: { ...config.marketing, lookbookBannerRatio: e.target.value }
                  })}
                >
                  <option value="default">Default (~400px Hero)</option>
                  <option value="tall">Tall / Luxury (~650px)</option>
                  <option value="cinematic">Cinematic Widescreen (16:9)</option>
                  <option value="contain">Natural Uncropped</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--color-on-surface)", marginBottom: "8px" }}>
                  GRID ITEMS ASPECT RATIO
                </label>
                <select 
                  className="search-input"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--color-outline)", borderRadius: "4px" }}
                  value={config.marketing?.lookbookItemRatio || "3/4"}
                  onChange={(e) => setConfig({
                    ...config,
                    marketing: { ...config.marketing, lookbookItemRatio: e.target.value }
                  })}
                >
                  <option value="3/4">Portrait / Tall Luxury (3:4)</option>
                  <option value="1/1">Square (1:1)</option>
                  <option value="16/9">Cinematic Widescreen (16:9)</option>
                  <option value="4/3">Landscape (4:3)</option>
                  <option value="auto">Natural Original Ratio</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--color-on-surface)", marginBottom: "8px" }}>
                BANNER HEADING TITLE
              </label>
              <input 
                type="text" 
                className="search-input" 
                style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--color-outline)", borderRadius: "4px" }}
                value={config.marketing?.lookbookTitle !== undefined ? config.marketing.lookbookTitle : "The Lookbook"} 
                onChange={(e) => setConfig({
                  ...config,
                  marketing: { ...config.marketing, lookbookTitle: e.target.value }
                })}
                placeholder="The Lookbook"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--color-on-surface)", marginBottom: "8px" }}>
                BANNER SUBTITLE
              </label>
              <input 
                type="text" 
                className="search-input" 
                style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--color-outline)", borderRadius: "4px" }}
                value={config.marketing?.lookbookSubtitle !== undefined ? config.marketing.lookbookSubtitle : "Explore our editorial galleries and styled collections."} 
                onChange={(e) => setConfig({
                  ...config,
                  marketing: { ...config.marketing, lookbookSubtitle: e.target.value }
                })}
                placeholder="Explore our editorial galleries and styled collections."
              />
            </div>
          </div>
        </section>
      )}

      {/* 3D Slider Settings */}
      {config && (
        <section className="card" style={{ padding: "28px", marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--color-primary)", margin: 0 }}>
                Lookbook 3D Slider Images
              </h3>
              <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", margin: "4px 0 0 0" }}>
                Upload and reorder images for the automated Faux 3D Slider displayed on the lookbook page.
              </p>
            </div>
            <button 
              className="btn-secondary" 
              onClick={() => {
                const current = config.storefront?.lookbookSlider || [];
                setConfig({
                  ...config,
                  storefront: { ...config.storefront, lookbookSlider: [...current, ""] }
                });
              }}
            >
              + ADD SLIDER IMAGE
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {(!config.storefront?.lookbookSlider || config.storefront.lookbookSlider.length === 0) ? (
              <p style={{ color: "var(--color-on-surface-variant)", fontSize: "14px" }}>No images added yet.</p>
            ) : (
              config.storefront.lookbookSlider.map((img: string, idx: number) => (
                <div key={idx} style={{ display: "flex", gap: "16px", alignItems: "center", padding: "16px", background: "var(--color-surface-container)", borderRadius: "8px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <button className="btn-icon" disabled={idx === 0} onClick={() => {
                      const arr = [...config.storefront.lookbookSlider];
                      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                      setConfig({ ...config, storefront: { ...config.storefront, lookbookSlider: arr } });
                    }}><span className="material-symbols-outlined">keyboard_arrow_up</span></button>
                    <span style={{ textAlign: "center", fontWeight: "bold" }}>{idx + 1}</span>
                    <button className="btn-icon" disabled={idx === config.storefront.lookbookSlider.length - 1} onClick={() => {
                      const arr = [...config.storefront.lookbookSlider];
                      [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                      setConfig({ ...config, storefront: { ...config.storefront, lookbookSlider: arr } });
                    }}><span className="material-symbols-outlined">keyboard_arrow_down</span></button>
                  </div>
                  
                  {img && (
                    <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                      <img src={img} alt={`Slide ${idx+1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <ImageUpload onUploadSuccess={(url) => {
                      const arr = [...config.storefront.lookbookSlider];
                      arr[idx] = url;
                      setConfig({ ...config, storefront: { ...config.storefront, lookbookSlider: arr } });
                    }} />
                  </div>

                  <button className="btn-icon" style={{ color: "#ba1a1a" }} onClick={() => {
                    const arr = config.storefront.lookbookSlider.filter((_: string, i: number) => i !== idx);
                    setConfig({ ...config, storefront: { ...config.storefront, lookbookSlider: arr } });
                  }}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <section className="card">
        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>Loading lookbook entries...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-on-surface-variant)" }}>
            No lookbook entries found. Create one to get started.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>COVER</th>
                  <th>TITLE</th>
                  <th>CATEGORY</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ width: "60px", height: "60px", borderRadius: "4px", overflow: "hidden", background: "var(--color-surface-container)" }}>
                        {item.images && item.images[0] && (
                          isVideo(item.images[0]) ? (
                            <video src={item.images[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted loop playsInline autoPlay />
                          ) : (
                            <img src={item.images[0]} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          )
                        )}
                      </div>
                    </td>
                    <td><span className="product-name">{item.name}</span></td>
                    <td>{item.category}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/admin/lookbook/${item.id}`} className="action-btn">
                        <span className="material-symbols-outlined">edit_note</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
