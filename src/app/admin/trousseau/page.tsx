"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";

interface TrousseauOccasion {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  image: string;
  highlight: string;
  price: string;
  link: string;
}

export default function AdminTrousseauPage() {
  const [title, setTitle] = useState("THE ROYAL BRIDAL TROUSSEAU");
  const [subtitle, setSubtitle] = useState("INTERACTIVE CURATION");
  const [occasions, setOccasions] = useState<TrousseauOccasion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/trousseau")
      .then(res => res.json())
      .then(data => {
        if (data.title) setTitle(data.title);
        if (data.subtitle) setSubtitle(data.subtitle);
        if (Array.isArray(data.occasions)) setOccasions(data.occasions);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error loading trousseau config:", err);
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/trousseau", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subtitle, occasions })
      });
      if (res.ok) {
        setMessage("✅ Showcase settings updated successfully!");
        setTimeout(() => setMessage(""), 4000);
      } else {
        setMessage("❌ Failed to save changes.");
      }
    } catch (err) {
      setMessage("❌ Error saving changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateOccasion = (index: number, field: keyof TrousseauOccasion, val: string) => {
    const updated = [...occasions];
    updated[index] = { ...updated[index], [field]: val };
    setOccasions(updated);
  };

  const handleAdd = () => {
    const newOcc: TrousseauOccasion = {
      id: "occ-" + Date.now(),
      title: "New Occasion",
      subtitle: "CELEBRATION SUITE",
      highlight: "Featured Masterpiece",
      price: "₹5,000",
      desc: "Describe this exquisite bridal trousseau curation...",
      image: "/images/lookbook_hero.png",
      link: "/necklaces"
    };
    setOccasions([...occasions, newOcc]);
  };

  const handleDelete = (index: number) => {
    if (confirm("Remove this occasion card from the showcase?")) {
      setOccasions(occasions.filter((_, i) => i !== index));
    }
  };

  const moveItem = (index: number, dir: "up" | "down") => {
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= occasions.length) return;
    const updated = [...occasions];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setOccasions(updated);
  };

  if (isLoading) {
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "var(--color-on-surface-variant)" }}>
        Loading Showcase Manager...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "80px" }}>
      <header className="page-header" style={{ marginBottom: "36px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--color-on-surface)" }}>
            Bridal Trousseau Showcase
          </h1>
          <p style={{ color: "var(--color-on-surface-variant)", margin: 0, fontSize: "14px" }}>
            Manage the interactive tabs, editorial imagery, and curated bridal pieces shown at position 6 on the homepage.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary"
          style={{ padding: "12px 24px", fontSize: "13px", fontWeight: 700, cursor: isSaving ? "wait" : "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span className="material-symbols-outlined">{isSaving ? "sync" : "save"}</span>
          {isSaving ? "Saving..." : "Save All Changes"}
        </button>
      </header>

      {message && (
        <div style={{ padding: "14px 20px", borderRadius: "8px", marginBottom: "24px", backgroundColor: message.includes("✅") ? "rgba(10,77,60,0.1)" : "rgba(180,30,30,0.1)", border: message.includes("✅") ? "1px solid #0a4d3c" : "1px solid #b41e1e", color: message.includes("✅") ? "#0a4d3c" : "#b41e1e", fontWeight: 600 }}>
          {message}
        </div>
      )}

      {/* Header Texts Configuration */}
      <section style={{ backgroundColor: "var(--color-surface)", padding: "28px", borderRadius: "16px", border: "1px solid var(--color-outline-variant)", marginBottom: "36px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="material-symbols-outlined" style={{ color: "var(--color-primary)" }}>title</span>
          Section Header Titles
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", color: "var(--color-on-surface-variant)" }}>
              Top Badge / Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", fontSize: "14px" }}
              placeholder="e.g. INTERACTIVE CURATION"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", color: "var(--color-on-surface-variant)" }}>
              Main Display Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", fontSize: "14px", fontWeight: 600 }}
              placeholder="e.g. THE ROYAL BRIDAL TROUSSEAU"
            />
          </div>
        </div>
      </section>

      {/* Occasion Cards Management */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="material-symbols-outlined" style={{ color: "var(--color-primary)" }}>style</span>
          Occasion Cards ({occasions.length})
        </h2>
        <button
          onClick={handleAdd}
          style={{ padding: "10px 18px", borderRadius: "8px", backgroundColor: "var(--color-surface-container)", border: "1px solid var(--color-primary)", color: "var(--color-primary)", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add_circle</span>
          Add Occasion Tab
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {occasions.map((occ, index) => (
          <div key={occ.id || index} style={{ backgroundColor: "var(--color-surface)", borderRadius: "16px", border: "1px solid var(--color-outline-variant)", padding: "28px", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid var(--color-outline-variant)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700 }}>
                  {index + 1}
                </span>
                <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--color-on-surface)" }}>
                  Tab: {occ.title || "Untitled Card"}
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                  style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container)", cursor: index === 0 ? "not-allowed" : "pointer", opacity: index === 0 ? 0.5 : 1 }}
                  title="Move Up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, "down")}
                  disabled={index === occasions.length - 1}
                  style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container)", cursor: index === occasions.length - 1 ? "not-allowed" : "pointer", opacity: index === occasions.length - 1 ? 0.5 : 1 }}
                  title="Move Down"
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(180,30,30,0.3)", background: "rgba(180,30,30,0.08)", color: "#b41e1e", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                  Remove
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-on-surface-variant)", marginBottom: "6px" }}>
                  Tab Button Title
                </label>
                <input
                  type="text"
                  value={occ.title}
                  onChange={e => updateOccasion(index, "title", e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", fontSize: "14px" }}
                  placeholder="e.g. Haldi & Mehndi"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-on-surface-variant)", marginBottom: "6px" }}>
                  Overlay Subtitle Tag
                </label>
                <input
                  type="text"
                  value={occ.subtitle}
                  onChange={e => updateOccasion(index, "subtitle", e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", fontSize: "14px" }}
                  placeholder="e.g. VIBRANT & SUN-KISSED"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-on-surface-variant)", marginBottom: "6px" }}>
                  Featured Piece Name
                </label>
                <input
                  type="text"
                  value={occ.highlight}
                  onChange={e => updateOccasion(index, "highlight", e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", fontSize: "14px", fontWeight: 600, color: "var(--color-primary)" }}
                  placeholder="e.g. 18K Polki Drops"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-on-surface-variant)", marginBottom: "6px" }}>
                  Starting Price Display
                </label>
                <input
                  type="text"
                  value={occ.price}
                  onChange={e => updateOccasion(index, "price", e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", fontSize: "14px" }}
                  placeholder="e.g. ₹4,500"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "18px", marginBottom: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-on-surface-variant)", marginBottom: "6px" }}>
                  Editorial Image URL / Path
                </label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <input
                    type="text"
                    value={occ.image}
                    onChange={e => updateOccasion(index, "image", e.target.value)}
                    style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", fontSize: "14px" }}
                    placeholder="/images/bride.jpg or https://..."
                  />
                  <div style={{ marginTop: "-4px" }}>
                    <ImageUpload 
                      onUploadSuccess={(url) => updateOccasion(index, "image", url)} 
                      buttonText="Upload"
                    />
                  </div>
                  {occ.image && (
                    <img src={occ.image} alt="preview" style={{ width: "44px", height: "44px", borderRadius: "6px", objectFit: "cover", border: "1px solid var(--color-outline)" }} />
                  )}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-on-surface-variant)", marginBottom: "6px" }}>
                  Button Destination URL
                </label>
                <input
                  type="text"
                  value={occ.link}
                  onChange={e => updateOccasion(index, "link", e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", fontSize: "14px" }}
                  placeholder="/necklaces or /bridal"
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-on-surface-variant)", marginBottom: "6px" }}>
                Master Stylist Description Text
              </label>
              <textarea
                rows={2}
                value={occ.desc}
                onChange={e => updateOccasion(index, "desc", e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", fontSize: "14px", fontFamily: "inherit", resize: "vertical" }}
                placeholder="Describe the occasion look and styling advice..."
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "40px", textAlign: "right" }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary"
          style={{ padding: "16px 36px", fontSize: "14px", fontWeight: 700, cursor: isSaving ? "wait" : "pointer" }}
        >
          {isSaving ? "Saving Updates..." : "Save All Showcase Settings"}
        </button>
      </div>
    </div>
  );
}
