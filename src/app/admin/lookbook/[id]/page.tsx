"use client";

import React, { useState, useEffect, Suspense, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";
import { isVideo } from "@/lib/media";

export default function AdminLookbookEditor({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div style={{ padding: "40px" }}>Loading editor...</div>}>
      <LookbookForm params={params} />
    </Suspense>
  );
}

function LookbookForm({ params }: { params: Promise<{ id: string }> }) {
  const { id: paramId } = use(params);
  const isNew = paramId === "new";
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>(["", "", "", ""]);
  const [globalCategories, setGlobalCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && data.productCategories) {
          setGlobalCategories(data.productCategories);
        }
      })
      .catch(err => console.error("Failed to fetch config:", err));
  }, []);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/lookbook/${paramId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setName(data.name || "");
            setCategory(data.category || "");
            setDescription(data.description || "");
            setImages(data.images || ["", "", "", ""]);
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [paramId, isNew]);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = isNew ? "/api/lookbook" : `/api/lookbook/${paramId}`;
    const method = isNew ? "POST" : "PUT";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, description, images })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          router.push("/admin/lookbook");
        } else {
          alert("Error: " + data.error);
        }
      })
      .catch(err => alert("Failed to save lookbook item"));
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  if (isLoading) return <div style={{ padding: "40px" }}>Fetching lookbook details...</div>;

  return (
    <>
      <header className="page-header" style={{ borderBottom: "1px solid rgba(192, 200, 196, 0.1)", paddingBottom: "24px", marginBottom: "48px" }}>
        <div>
          <nav className="copyright" style={{ display: "flex", gap: "8px", fontSize: "11px", fontWeight: "700" }}>
            <Link href="/admin/lookbook" style={{ color: "var(--color-on-surface-variant)", textDecoration: "none" }}>LOOKBOOK</Link>
            <span>/</span>
            <span style={{ color: "var(--color-primary)" }}>{isNew ? "NEW ENTRY" : "EDIT ENTRY"}</span>
          </nav>
        </div>
        <div className="header-actions">
          <Link href="/admin/lookbook" className="btn btn-outline" style={{ textDecoration: "none" }}>Discard</Link>
          <button onClick={handleSave} className="btn btn-primary" style={{ padding: "12px 32px" }}>SAVE CHANGES</button>
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "row", gap: "48px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: "48px" }}>
          <section style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div>
              <h3 className="card-title">Editorial Details</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="copyright" style={{ opacity: 0.6 }}>TITLE</label>
                <input className="search-input" style={{ paddingLeft: "12px", borderBottom: "1px solid rgba(115, 92, 0, 0.2)" }} type="text" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="copyright" style={{ opacity: 0.6 }}>CATEGORY</label>
                <select 
                  className="search-input" 
                  style={{ paddingLeft: "12px", borderBottom: "1px solid rgba(115, 92, 0, 0.2)", cursor: "pointer" }} 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                >
                  {Array.from(new Set(["General", "Bridal", "Necklaces", "Earrings", ...globalCategories])).map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="copyright" style={{ opacity: 0.6 }}>DESCRIPTION</label>
              <textarea className="search-input" style={{ paddingLeft: "12px", borderBottom: "1px solid rgba(115, 92, 0, 0.2)", height: "80px", resize: "none" }} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "32px", paddingTop: "48px", borderTop: "1px solid rgba(192, 200, 196, 0.1)" }}>
            <div>
              <h3 className="card-title">Image Gallery (4 Required)</h3>
              <p style={{ color: "var(--color-on-surface-variant)", fontSize: "14px" }}>Provide 4 images for the full overview layout.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ width: "60px", height: "60px", backgroundColor: "var(--color-surface-container)", borderRadius: "4px", overflow: "hidden" }}>
                    {images[i] ? (
                      isVideo(images[i]) ? (
                        <video src={images[i]} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted loop playsInline autoPlay />
                      ) : (
                        <img src={images[i]} alt={`Slot ${i+1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )
                    ) : (
                      <div style={{ fontSize: "10px", textAlign: "center", padding: "20px 0", color: "var(--color-on-surface-variant)" }}>{i+1}</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="copyright" style={{ opacity: 0.6, fontSize: "9px" }}>IMAGE {i+1} URL</label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input className="search-input" style={{ paddingLeft: "12px", borderBottom: "1px solid rgba(115, 92, 0, 0.2)", width: "100%" }} type="text" value={images[i] || ""} onChange={e => updateImage(i, e.target.value)} />
                      <ImageUpload onUploadSuccess={(url) => updateImage(i, url)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
