"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";

export default function AdminCollectionEditor({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = React.use(params);
  const isNew = slug === "new";

  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    description: "",
    bannerImage: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop",
    heroRatio: "cover",
    filterCategory: "",
    allowedColors: [] as string[]
  });

  const [globalColors, setGlobalColors] = useState<{name: string, hex: string}[]>([]);
  const [globalCategories, setGlobalCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && data.colors) {
          setGlobalColors(data.colors);
        }
        if (data && data.productCategories) {
          setGlobalCategories(data.productCategories);
        }
      })
      .catch(err => console.error("Failed to fetch global config:", err));

    if (!isNew) {
      fetch("/api/collections")
        .then(res => res.json())
        .then(data => {
          const found = Array.isArray(data) ? data.find((c: any) => c.slug === slug) : null;
          if (found) setFormData(found);
          setIsLoading(false);
        });
    }
  }, [isNew, slug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const method = isNew ? "POST" : "PUT";
    const payload = isNew ? formData : { ...formData, originalSlug: slug };
    
    await fetch("/api/collections", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    router.push("/admin/collections");
  };

  if (isLoading) return <div style={{ padding: "48px", textAlign: "center", color: "var(--color-on-surface-variant)" }}>Loading...</div>;

  return (
    <>
      <header className="page-header" style={{ marginBottom: "48px", display: "flex", gap: "24px", alignItems: "center" }}>
        <Link href="/admin/collections" style={{ textDecoration: "none", color: "var(--color-on-surface-variant)", display: "flex" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>arrow_back</span>
        </Link>
        <div>
          <h2 className="page-title">{isNew ? "Create New Collection" : "Edit Collection"}</h2>
          <p className="page-subtitle">Configure your dynamic landing page</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="dashboard-grid" style={{ gridTemplateColumns: "2fr 1fr", alignItems: "start" }}>
        
        {/* Main Editor */}
        <section className="card" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="form-group">
            <label className="form-label">Page Title</label>
            <input 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              className="form-input" 
              placeholder="e.g., Luxury Diamond Rings" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Page Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="form-input" 
              placeholder="A beautiful description for the hero banner..." 
              rows={4} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Banner Image URL</label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input 
                name="bannerImage" 
                value={formData.bannerImage} 
                onChange={handleChange} 
                className="form-input" 
                placeholder="https://..." 
                required 
                style={{ flex: 1 }}
              />
              <ImageUpload onUploadSuccess={(url) => setFormData(prev => ({ ...prev, bannerImage: url }))} />
            </div>
            {formData.bannerImage && (
              <div style={{ marginTop: "16px", borderRadius: "8px", overflow: "hidden", height: "240px", border: "1px solid var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={formData.bannerImage} alt="Banner Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
            )}

            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">Hero Banner Display Ratio & Fit</label>
              <select
                name="heroRatio"
                value={(formData as any).heroRatio || "cover"}
                onChange={handleChange}
                className="form-input"
              >
                <option value="cover">Cover (Fills Banner - Standard)</option>
                <option value="contain">Auto Fit / Contain (Recommended - Show Entire Jewelry Photo)</option>
                <option value="tall">Tall Banner (~450px Portrait)</option>
                <option value="compact">Compact Header (~200px Strip)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Sidebar Settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <section className="card">
            <h4 className="card-title">Routing & Display</h4>
            
            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">URL Slug</label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ padding: "16px", backgroundColor: "var(--color-surface-container)", border: "1px solid var(--color-outline-variant)", borderRight: "none", color: "var(--color-on-surface-variant)" }}>
                  /
                </span>
                <input 
                  name="slug" 
                  value={formData.slug} 
                  onChange={handleChange} 
                  className="form-input" 
                  style={{ borderRadius: "0 4px 4px 0" }}
                  placeholder="e.g., rings" 
                  required 
                />
              </div>
              <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", marginTop: "8px" }}>
                The web address for this page. Must be unique and lowercase. Changing this will break existing links.
              </p>
            </div>

            <div className="form-group" style={{ marginTop: "24px" }}>
              <label className="form-label">Product Category Filter</label>
              <select name="filterCategory" value={formData.filterCategory} onChange={handleChange} className="form-input">
                <option value="">Select Category</option>
                {Array.from(new Set(["Necklace", "Bracelet", "Earring", "Ring", "Bangle", "Korean", "Bridal", ...globalCategories])).map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginTop: "24px" }}>
              <label className="form-label">Enabled Color Filters</label>
              <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", marginBottom: "12px", marginTop: "-4px" }}>
                Select which global colors should appear in the filter sidebar for this collection.
              </p>
              {globalColors.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {globalColors.map((gc, i) => {
                    const isAllowed = formData.allowedColors?.includes(gc.name);
                    return (
                      <label
                        key={i}
                        style={{
                          display: "flex", alignItems: "center", gap: "6px",
                          padding: "6px 12px", borderRadius: "100px", 
                          border: isAllowed ? "1px solid var(--color-primary)" : "1px solid rgba(192, 200, 196, 0.5)",
                          background: isAllowed ? "rgba(115, 92, 0, 0.05)" : "transparent", 
                          cursor: "pointer"
                        }}
                      >
                        <input 
                          type="checkbox"
                          className="hidden"
                          checked={isAllowed || false}
                          onChange={(e) => {
                            const allowed = formData.allowedColors || [];
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, allowedColors: [...allowed, gc.name] }));
                            } else {
                              setFormData(prev => ({ ...prev, allowedColors: allowed.filter(n => n !== gc.name) }));
                            }
                          }}
                        />
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: gc.hex, border: "1px solid rgba(0,0,0,0.1)" }} />
                        <span style={{ fontSize: "12px", fontWeight: isAllowed ? "500" : "400" }}>{gc.name}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", fontStyle: "italic" }}>
                  Please define Global Colors in Settings first.
                </p>
              )}
            </div>
          </section>

          <section className="card">
            <h4 className="card-title">Actions</h4>
            <button type="submit" disabled={isSaving} className="btn-primary" style={{ width: "100%", marginTop: "16px", padding: "16px" }}>
              {isSaving ? "SAVING..." : isNew ? "PUBLISH COLLECTION" : "SAVE CHANGES"}
            </button>
            <Link href="/admin/collections">
              <button type="button" className="btn-primary" style={{ width: "100%", marginTop: "12px", padding: "16px", backgroundColor: "transparent", border: "1px solid var(--color-error)", color: "var(--color-error)" }}>
                CANCEL
              </button>
            </Link>
          </section>
        </div>

      </form>
    </>
  );
}
