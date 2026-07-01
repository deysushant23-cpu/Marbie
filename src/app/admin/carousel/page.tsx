"use client";

import React, { useState, useEffect } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { isVideo } from "@/lib/media";

const RATIO_OPTIONS = [
  { value: "default",   label: "Luxury Tall (default ~800px)",        icon: "📐" },
  { value: "tall",      label: "Full Viewport Tall (90vh)",            icon: "⬆️" },
  { value: "cinematic", label: "Cinematic Widescreen (~500–600px)",    icon: "🎬" },
  { value: "compact",   label: "Compact Banner (~380px)",              icon: "📏" },
  { value: "square",    label: "Square (1:1, max 700px)",              icon: "⬛" },
];

export default function AdminCarouselSettings() {
  const [slides, setSlides] = useState<any[]>([]);
  const [heroRatio, setHeroRatio] = useState("default");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/carousel").then((res) => res.json()),
      fetch("/api/config").then((res) => res.json()),
    ])
      .then(([slidesData, configData]) => {
        if (Array.isArray(slidesData)) setSlides(slidesData);
        if (configData?.heroRatio) setHeroRatio(configData.heroRatio);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save slides
      const slidesRes = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slides),
      });
      // Save ratio to config
      const configRes = await fetch("/api/config");
      const config = await configRes.json();
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, heroRatio }),
      });
      if (slidesRes.ok) {
        alert("✅ Carousel & banner ratio saved successfully!");
      } else {
        alert("Failed to save slides.");
      }
    } catch {
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSlide = () => {
    setSlides([
      ...slides,
      {
        id: Math.max(0, ...slides.map(s => s.id)) + 1,
        image: "",
        title: "",
        subtitle: "",
        active: false
      }
    ]);
  };

  const handleRemoveSlide = (id: number) => {
    setSlides(slides.filter((slide) => slide.id !== id));
  };

  if (loading) {
    return <div style={{ padding: "64px", textAlign: "center" }}>Loading settings...</div>;
  }

  return (
    <div style={{ paddingBottom: "64px" }}>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Carousel & Hero Banner</h1>
          <p className="admin-subtitle">Manage homepage hero slides and banner display settings.</p>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <button className="btn-secondary" onClick={handleAddSlide} style={{ padding: "12px 24px" }}>
            + Add Slide
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: "12px 24px" }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* ── Banner Ratio / Height Selector ── */}
      <section className="dashboard-card" style={{ padding: "28px 32px", marginTop: "32px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-primary)", marginBottom: "6px" }}>
          🖼️ Hero Banner Height / Ratio
        </h2>
        <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant)", marginBottom: "20px" }}>
          Choose how tall the homepage banner appears. Changes take effect after saving.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
          {RATIO_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setHeroRatio(opt.value)}
              style={{
                padding: "14px 16px",
                borderRadius: "10px",
                border: heroRatio === opt.value
                  ? "2px solid var(--color-primary)"
                  : "1px solid var(--color-outline-variant)",
                backgroundColor: heroRatio === opt.value
                  ? "var(--color-primary-container)"
                  : "var(--color-surface)",
                color: heroRatio === opt.value
                  ? "var(--color-on-primary-container)"
                  : "var(--color-on-surface)",
                fontWeight: heroRatio === opt.value ? 700 : 500,
                fontSize: "13px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "20px" }}>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Slides ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "32px" }}>
        {slides.map((slide, index) => (
          <div key={slide.id} className="dashboard-card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)", margin: 0 }}>Slide {index + 1}</h2>
                {slide.image && (
                  <span style={{
                    fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
                    padding: "3px 10px", borderRadius: "20px",
                    backgroundColor: isVideo(slide.image) ? "rgba(99,102,241,0.12)" : "rgba(0,36,27,0.08)",
                    color: isVideo(slide.image) ? "#6366f1" : "var(--color-primary)",
                    border: isVideo(slide.image) ? "1px solid rgba(99,102,241,0.3)" : "1px solid var(--color-outline-variant)",
                  }}>
                    {isVideo(slide.image) ? "🎬 VIDEO" : "🖼️ IMAGE"}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleRemoveSlide(slide.id)}
                style={{ color: "var(--color-error)", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", fontWeight: "500" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                Remove
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "32px" }}>
              <div>
                {slide.image ? (
                  isVideo(slide.image) ? (
                    <video src={slide.image} autoPlay loop muted playsInline style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--color-outline-variant)" }} />
                  ) : (
                    <img src={slide.image} alt={`Slide ${index + 1}`} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--color-outline-variant)" }} />
                  )
                ) : (
                  <div style={{ width: "100%", aspectRatio: "3/4", backgroundColor: "var(--color-surface-variant)", borderRadius: "4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px dashed var(--color-outline)", gap: "8px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "var(--color-on-surface-variant)" }}>image</span>
                    <span style={{ color: "var(--color-on-surface-variant)", fontSize: "12px" }}>No Media</span>
                  </div>
                )}
                <ImageUpload
                  onUploadSuccess={(url) => {
                    const newSlides = [...slides];
                    newSlides[index].image = url;
                    setSlides(newSlides);
                  }}
                  buttonText="Upload Image / Video"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="form-group">
                  <label className="form-label">Media URL (Image or Video)</label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="text"
                      className="form-input"
                      value={slide.image}
                      onChange={(e) => {
                        const newSlides = [...slides];
                        newSlides[index].image = e.target.value;
                        setSlides(newSlides);
                      }}
                      placeholder="https://... or /images/video.mp4"
                      style={{ flex: 1 }}
                    />
                    <ImageUpload
                      onUploadSuccess={(url) => {
                        const newSlides = [...slides];
                        newSlides[index].image = url;
                        setSlides(newSlides);
                      }}
                    />
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", marginTop: "4px" }}>
                    Accepts images (JPG, PNG, WebP) and videos (MP4, WebM, MOV). Videos play silently on loop.
                  </p>
                </div>
                <div className="form-group">
                  <label className="form-label">Title (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={slide.title}
                    onChange={(e) => {
                      const newSlides = [...slides];
                      newSlides[index].title = e.target.value;
                      setSlides(newSlides);
                    }}
                    placeholder="Timeless Elegance"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subtitle (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={slide.subtitle}
                    onChange={(e) => {
                      const newSlides = [...slides];
                      newSlides[index].subtitle = e.target.value;
                      setSlides(newSlides);
                    }}
                    placeholder="LUXURY REDEFINED"
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                  <input
                    type="checkbox"
                    checked={slide.active}
                    onChange={(e) => {
                      const newSlides = [...slides];
                      newSlides[index].active = e.target.checked;
                      setSlides(newSlides);
                    }}
                    id={`active-${slide.id}`}
                    style={{ width: "20px", height: "20px", accentColor: "var(--color-primary)" }}
                  />
                  <label htmlFor={`active-${slide.id}`} style={{ fontSize: "14px", color: "var(--color-on-surface)", fontWeight: "500", cursor: "pointer" }}>Active (Display on Homepage)</label>
                </div>
              </div>
            </div>
          </div>
        ))}

        {slides.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px", color: "var(--color-on-surface-variant)", border: "1px dashed var(--color-outline)", borderRadius: "16px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "48px", display: "block", marginBottom: "12px" }}>slideshow</span>
            No slides yet. Click "+ Add Slide" to create your first banner.
          </div>
        )}
      </div>
    </div>
  );
}
