"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminCollections() {
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/collections")
      .then(res => res.json())
      .then(data => {
        setCollections(Array.isArray(data) ? data : []);
        setIsLoading(false);
      });
  }, []);

  const handleDelete = async (slug: string) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      await fetch(`/api/collections?slug=${slug}`, { method: "DELETE" });
      setCollections(collections.filter(c => c.slug !== slug));
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= collections.length) return;

    const newCollections = [...collections];
    const temp = newCollections[index];
    newCollections[index] = newCollections[targetIndex];
    newCollections[targetIndex] = temp;

    setCollections(newCollections);
    try {
      await fetch("/api/collections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCollections),
      });
    } catch (err) {
      console.error("Failed to reorder", err);
    }
  };

  return (
    <>
      <header className="page-header" style={{ marginBottom: "48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 className="page-title">Storefront Categories & Collections</h2>
          <p className="page-subtitle">Manage your top 4 header navigation categories, sidebar menu links, and dynamic product suites.</p>
        </div>
        <Link href="/admin/collections/new">
          <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
            NEW CATEGORY / COLLECTION
          </button>
        </Link>
      </header>

      <section className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrapper">
          {isLoading ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--color-on-surface-variant)" }}>Loading categories...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order / Placement</th>
                  <th>Title</th>
                  <th>URL Slug</th>
                  <th>Target Filter</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((collection, idx) => (
                  <tr key={collection.slug || idx}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <button 
                            onClick={() => handleReorder(idx, "up")} 
                            disabled={idx === 0}
                            style={{ background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.2 : 0.8, color: "var(--color-on-surface)", padding: 0, display: "flex" }}
                            title="Move Up"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>keyboard_arrow_up</span>
                          </button>
                          <button 
                            onClick={() => handleReorder(idx, "down")} 
                            disabled={idx === collections.length - 1}
                            style={{ background: "none", border: "none", cursor: idx === collections.length - 1 ? "default" : "pointer", opacity: idx === collections.length - 1 ? 0.2 : 0.8, color: "var(--color-on-surface)", padding: 0, display: "flex" }}
                            title="Move Down"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>keyboard_arrow_down</span>
                          </button>
                        </div>
                        {idx < 4 ? (
                          <span style={{ backgroundColor: "rgba(0, 115, 78, 0.15)", color: "var(--color-primary)", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.05em" }}>
                            HEADER NAV ({idx + 1} of 4)
                          </span>
                        ) : (
                          <span style={{ backgroundColor: "rgba(0,0,0,0.06)", color: "var(--color-on-surface-variant)", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "600" }}>
                            SIDEBAR ONLY
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="product-cell">
                        <div className="product-img" style={{ width: "48px", height: "48px", borderRadius: "4px", position: "relative", overflow: "hidden" }}>
                          {collection.bannerImage?.match(/\.(mp4|webm|ogg)(\?.*)?$/i) ? (
                            <video src={collection.bannerImage} autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <img alt={collection.title} src={collection.bannerImage || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=200"} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                          )}
                        </div>
                        <div>
                          <p className="product-name" style={{ fontWeight: "700", fontSize: "14px" }}>{collection.title}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--color-primary)", fontWeight: "600" }}>/{collection.slug}</td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)" }}>
                        {collection.filterCategory || collection.slug}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", alignItems: "center" }}>
                        <Link href={`/${collection.slug}`} target="_blank" className="action-btn" title="View Live Storefront" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
                          <span className="material-symbols-outlined">open_in_new</span>
                        </Link>
                        <Link href={`/admin/collections/${collection.slug}`} className="action-btn" title="Edit Settings" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
                          <span className="material-symbols-outlined">edit</span>
                        </Link>
                        <button className="action-btn" title="Delete Category" onClick={() => handleDelete(collection.slug)} style={{ color: "var(--color-error)" }}>
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
