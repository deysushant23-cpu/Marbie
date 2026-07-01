"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";
import { isVideo } from "@/lib/media";

export default function AdminEditProduct() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px", color: "var(--color-primary)", fontWeight: "500" }}>
        Loading catalog management...
      </div>
    }>
      <ProductPageRouter />
    </Suspense>
  );
}

function ProductPageRouter() {
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id");
  if (!rawId || rawId === "list") {
    return <ProductsListTable />;
  }
  return <ProductForm productId={rawId} />;
}

function ProductForm({ productId }: { productId: string }) {
  const router = useRouter();
  const isNew = productId === "new";

  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("0");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("Bracelets");
  const [stockCount, setStockCount] = useState(0);
  const [description, setDescription] = useState("");
  const [dimensions, setDimensions] = useState("5cm x 3cm");
  const [weight, setWeight] = useState("15g");
  const [productImage, setProductImage] = useState("");
  const [badge, setBadge] = useState("");
  const [additionalImagesText, setAdditionalImagesText] = useState("");
  const [colors, setColors] = useState<{name: string, hex: string}[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [globalColors, setGlobalColors] = useState<{name: string, hex: string}[]>([]);
  const [globalCategories, setGlobalCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      .catch(err => console.error("Failed to fetch config:", err));
  }, []);

  useEffect(() => {
    if (productId === "new") {
      setProductName("");
      setSku(`AUR-PROD-${Math.floor(100 + Math.random() * 900)}`);
      setPrice("0");
      setOriginalPrice("");
      setCategory("Bracelets");
      setStockCount(0);
      setDescription("");
      setDimensions("5cm x 3cm");
      setWeight("15g");
      setProductImage("");
      setBadge("");
      setAdditionalImagesText("");
      setColors([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setProductName(data.name || "");
          setSku(data.sku || "");
          setPrice((data.price || 0).toString());
          setOriginalPrice(data.originalPrice ? data.originalPrice.toString() : "");
          const rawCat = data.category || "Jewelry";
          const displayCategory = typeof rawCat === "string" && rawCat.length > 0 ? rawCat.charAt(0).toUpperCase() + rawCat.slice(1) : "Jewelry";
          setCategory(displayCategory);
          setStockCount(data.stock || 0);
          setDescription(data.description || "");
          setDimensions(data.dimensions || "5cm x 3cm");
          setWeight(data.weight || "15g");
          setProductImage(data.image || "");
          setBadge(data.badge || "");
          if (data.images && data.images.length > 0) {
            setAdditionalImagesText(data.images.join("\n"));
          } else {
            setAdditionalImagesText("");
          }
          if (data.colors) {
            setColors(data.colors);
          } else {
            setColors([]);
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch product details:", err);
        setIsLoading(false);
      });
  }, [productId]);

    const handleSave = (e: React.MouseEvent) => {
      e.preventDefault();
      const normalizedCategory = (category || "").toLowerCase();
    
    const url = isNew ? "/api/products" : `/api/products/${productId}`;
    const method = isNew ? "POST" : "PUT";

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: productName,
        sku,
        price: Number(price.replace(/,/g, "")),
        originalPrice: originalPrice ? Number(originalPrice.replace(/,/g, "")) : undefined,
        category: normalizedCategory,
        stock: stockCount,
        description,
        dimensions,
        weight,
        image: productImage,
        badge: badge || undefined,
        images: additionalImagesText ? additionalImagesText.split("\n").map(s => s.trim()).filter(Boolean) : undefined,
        colors: colors.length > 0 ? colors : undefined,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          router.push("/admin/products");
        } else {
          alert("Failed to save changes: " + (data.error || "Unknown error"));
        }
      })
      .catch((err) => {
        console.error("Failed to update product:", err);
        alert("Error saving changes");
      });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this product? This cannot be undone.")) {
      return;
    }
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && !data.error) {
        router.push("/admin/products");
      } else {
        alert("Failed to delete product: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Error deleting product");
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px", color: "var(--color-primary)" }}>
        Fetching product information...
      </div>
    );
  }

  return (
    <>
      {/* Top Header */}
      <header className="page-header" style={{ borderBottom: "1px solid rgba(192, 200, 196, 0.1)", paddingBottom: "24px", marginBottom: "48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <nav className="copyright" style={{ display: "flex", gap: "8px", fontSize: "11px", fontWeight: "700" }}>
            <Link href="/admin/products" style={{ color: "var(--color-on-surface-variant)", textDecoration: "none" }}>
              CATALOG
            </Link>
            <span>/</span>
            <span style={{ color: "var(--color-primary)" }}>{isNew ? "NEW PRODUCT" : "EDIT PRODUCT"}</span>
          </nav>
        </div>
        <div className="header-actions">
          {!isNew && (
            <button
              onClick={handleDelete}
              className="btn btn-outline"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#d32f2f", borderColor: "#d32f2f", cursor: "pointer", padding: "12px 24px" }}
              type="button"
            >
              <span className="material-symbols-outlined" style={{ marginRight: "8px", fontSize: "18px" }}>delete</span>
              Delete Product
            </button>
          )}
          <Link href="/admin/products">
            <button className="btn btn-outline" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: "12px 24px" }} type="button">
              Cancel
            </button>
          </Link>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", padding: "12px 24px" }}
            type="button"
          >
            SAVE CHANGES
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              check
            </span>
          </button>
        </div>
      </header>

      {/* Forms & Preview Split Layout */}
      <div style={{ display: "flex", flexDirection: "row", gap: "48px", flexWrap: "wrap" }}>
        {/* Left Column: Forms */}
        <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: "48px" }}>
          {/* Product Identity */}
          <section style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div>
              <h3 className="card-title" style={{ marginBottom: "8px" }}>
                Product Essence
              </h3>
              <p style={{ color: "var(--color-on-surface-variant)", fontSize: "14px", margin: 0 }}>
                Define the core characteristics of this fine jewelry piece.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
                  PRODUCT NAME
                </label>
                <input
                  className="search-input"
                  style={{ paddingLeft: "12px", borderBottom: "1px solid rgba(115, 92, 0, 0.2)" }}
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
                  SKU IDENTIFIER
                </label>
                <input
                  className="search-input"
                  style={{ paddingLeft: "12px", borderBottom: "1px solid rgba(115, 92, 0, 0.2)" }}
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
                  PRICE (INR)
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-on-surface-variant)" }}>
                    ₹
                  </span>
                  <input
                    className="search-input"
                    style={{ paddingLeft: "32px", borderBottom: "1px solid rgba(115, 92, 0, 0.2)" }}
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
                  ORIGINAL PRICE (CROSSED OUT)
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-on-surface-variant)" }}>
                    ₹
                  </span>
                  <input
                    className="search-input"
                    style={{ paddingLeft: "32px", borderBottom: "1px solid rgba(115, 92, 0, 0.2)" }}
                    type="text"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
                  PRODUCT LABEL (BADGE)
                </label>
                <input
                  className="search-input"
                  style={{ paddingLeft: "12px", borderBottom: "1px solid rgba(115, 92, 0, 0.2)" }}
                  type="text"
                  placeholder="e.g. Bestseller, -20%, New Arrival"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", gridColumn: "span 2" }}>
                <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
                  CATEGORY
                </label>
                <select
                  className="search-input"
                  style={{ paddingLeft: "12px", borderBottom: "1px solid rgba(115, 92, 0, 0.2)", cursor: "pointer" }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {Array.from(new Set(["Bracelets", "Necklaces", "Bridal", "Earrings", "Rings", "Bangles", "Korean Jewelry", ...globalCategories])).map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
                EDITORIAL DESCRIPTION
              </label>
              <textarea
                className="search-input"
                style={{
                  paddingLeft: "12px",
                  borderBottom: "1px solid rgba(115, 92, 0, 0.2)",
                  height: "120px",
                  resize: "none",
                  lineHeight: "1.8",
                }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </section>

          {/* Media management */}
          <section
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "32px",
              paddingTop: "48px",
              borderTop: "1px solid rgba(192, 200, 196, 0.1)",
            }}
          >
            <div>
              <h3 className="card-title" style={{ marginBottom: "8px" }}>
                Visual Showcase
              </h3>
              <p style={{ color: "var(--color-on-surface-variant)", fontSize: "14px", margin: 0 }}>
                High-resolution imagery that captures the soul of the craftsmanship.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "16px" }}>
              <div
                style={{
                  aspectRatio: "1/1",
                  position: "relative",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  overflow: "hidden",
                }}
              >
                {productImage ? (
                  isVideo(productImage) ? (
                    <video src={productImage} autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <img
                      alt="Product view"
                      src={productImage}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface-variant)", fontSize: "10px", textAlign: "center", padding: "16px" }}>
                    No Media
                  </div>
                )}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "var(--color-primary)", color: "white", fontSize: "9px", textAlign: "center", padding: "2px" }}>
                  PRIMARY
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", gridColumn: "span 2" }}>
                <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6, fontSize: "9px" }}>
                  MEDIA URL
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    className="search-input"
                    style={{ paddingLeft: "12px", borderBottom: "1px solid rgba(115, 92, 0, 0.2)", fontSize: "12px", flex: 1 }}
                    type="text"
                    value={productImage}
                    onChange={(e) => setProductImage(e.target.value)}
                    placeholder="Paste media URL here"
                  />
                  <ImageUpload folder="marbie-bridal/products" onUploadSuccess={(url) => setProductImage(url)} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6, fontSize: "9px" }}>
                  ADDITIONAL MEDIA (OPTIONAL, ONE URL PER LINE)
                </label>
                <ImageUpload 
                  folder="marbie-bridal/products"
                  onUploadSuccess={(url) => {
                    const current = additionalImagesText.trim();
                    setAdditionalImagesText(current ? `${current}\n${url}` : url);
                  }} 
                  buttonText="Upload Additional Image"
                />
              </div>
              <textarea
                className="search-input"
                style={{ paddingLeft: "12px", borderBottom: "1px solid rgba(115, 92, 0, 0.2)", fontSize: "12px", height: "80px", resize: "vertical" }}
                value={additionalImagesText}
                onChange={(e) => setAdditionalImagesText(e.target.value)}
                placeholder="Paste extra image URLs here, one on each line. These will be shown in the slider."
              />
            </div>
          </section>

          {/* Specifications */}
          <section
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "32px",
              paddingTop: "48px",
              borderTop: "1px solid rgba(192, 200, 196, 0.1)",
            }}
          >
            <div>
              <h3 className="card-title" style={{ marginBottom: "8px" }}>
                Specifications
              </h3>
              <p style={{ color: "var(--color-on-surface-variant)", fontSize: "14px", margin: 0 }}>
                Technical details for internal tracking and customer clarity.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "32px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
                  DIMENSIONS
                </label>
                <input
                  className="search-input"
                  style={{ paddingLeft: "12px", borderBottom: "1px solid rgba(115, 92, 0, 0.2)" }}
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
                  STOCK COUNT
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <button type="button" className="btn btn-outline" style={{ width: "32px", height: "32px", padding: 0 }} onClick={() => setStockCount(Math.max(0, stockCount - 1))}>
                    -
                  </button>
                  <span className="product-name" style={{ fontSize: "16px" }}>
                    {stockCount}
                  </span>
                  <button type="button" className="btn btn-outline" style={{ width: "32px", height: "32px", padding: 0 }} onClick={() => setStockCount(stockCount + 1)}>
                    +
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
                  WEIGHT
                </label>
                <input
                  className="search-input"
                  style={{ paddingLeft: "12px", borderBottom: "1px solid rgba(115, 92, 0, 0.2)" }}
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Colors */}
          <section
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "32px",
              paddingTop: "48px",
              borderTop: "1px solid rgba(192, 200, 196, 0.1)",
            }}
          >
            <div>
              <h3 className="card-title" style={{ marginBottom: "8px" }}>
                Colors
              </h3>
              <p style={{ color: "var(--color-on-surface-variant)", fontSize: "14px", margin: 0 }}>
                Specify available colors for this piece (used for filtering).
              </p>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {/* Global Palette Choices */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}>
                  CHOOSE FROM GLOBAL PALETTE
                </label>
                {globalColors.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    {globalColors.map((gc, i) => {
                      const isAdded = colors.some(c => c.name.toLowerCase() === gc.name.toLowerCase());
                      return (
                        <label
                          key={i}
                          style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "8px 16px", borderRadius: "100px", 
                            border: isAdded ? "2px solid var(--color-primary)" : "1px solid rgba(192, 200, 196, 0.5)",
                            background: isAdded ? "rgba(115, 92, 0, 0.05)" : "transparent", 
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          <input 
                            type="checkbox"
                            className="hidden"
                            checked={isAdded}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setColors([...colors, { name: gc.name, hex: gc.hex }]);
                              } else {
                                setColors(colors.filter(c => c.name.toLowerCase() !== gc.name.toLowerCase()));
                              }
                            }}
                          />
                          <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: gc.hex, border: "1px solid rgba(0,0,0,0.1)" }} />
                          <span style={{ fontSize: "14px", fontWeight: isAdded ? "600" : "500", color: isAdded ? "var(--color-primary)" : "var(--color-on-surface)" }}>{gc.name}</span>
                          {isAdded && <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--color-primary)" }}>check</span>}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)" }}>No colors defined in Global Settings.</p>
                )}
              </div>

              {/* Custom Color Add */}
              <div style={{ borderTop: "1px dashed rgba(192, 200, 196, 0.3)", paddingTop: "24px" }}>
                <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6, display: "block", marginBottom: "16px" }}>
                  OR ADD A CUSTOM COLOR FOR THIS PIECE
                </label>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: "200px" }}>
                    <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6, fontSize: "10px" }}>
                      CUSTOM COLOR NAME
                    </label>
                    <input
                      className="search-input"
                      style={{ paddingLeft: "12px", borderBottom: "1px solid rgba(115, 92, 0, 0.2)", width: "100%" }}
                      type="text"
                      placeholder="e.g. Ruby Red"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label className="copyright" style={{ color: "var(--color-on-surface-variant)", opacity: 0.6, fontSize: "10px" }}>
                      HEX CODE
                    </label>
                    <input
                      type="color"
                      style={{ width: "64px", height: "40px", cursor: "pointer", border: "1px solid rgba(115, 92, 0, 0.2)", padding: 0 }}
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                    />
                  </div>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    style={{ padding: "10px 24px", height: "40px" }}
                    onClick={() => {
                      if (newColorName.trim()) {
                        if (!colors.some(c => c.name.toLowerCase() === newColorName.trim().toLowerCase())) {
                          setColors([...colors, { name: newColorName.trim(), hex: newColorHex }]);
                          setNewColorName("");
                        } else {
                          alert("This color is already added to the product!");
                        }
                      } else {
                        alert("Please enter a Custom Color Name before adding.");
                      }
                    }}
                  >
                    ADD CUSTOM
                  </button>
                </div>

                {/* Display added Custom Colors only */}
                {colors.filter(c => !globalColors.some(gc => gc.name.toLowerCase() === c.name.toLowerCase())).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "16px" }}>
                    {colors.filter(c => !globalColors.some(gc => gc.name.toLowerCase() === c.name.toLowerCase())).map((c, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", border: "1px solid rgba(115, 92, 0, 0.2)", borderRadius: "20px", background: "var(--color-surface-container)" }}>
                        <div style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: c.hex, border: "1px solid rgba(0,0,0,0.1)" }} />
                        <span style={{ fontSize: "12px", fontWeight: "500" }}>{c.name} (Custom)</span>
                        <button 
                          type="button" 
                          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                          onClick={() => setColors(colors.filter(col => col.name !== c.name))}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#d32f2f" }}>close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Live Preview */}
        <div style={{ flex: "0 0 350px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="card" style={{ border: "1px solid rgba(115, 92, 0, 0.2)", boxShadow: "0 20px 40px rgba(6, 59, 47, 0.08)", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
              <span className="copyright" style={{ color: "var(--color-secondary)", fontWeight: "700" }}>
                LIVE PREVIEW
              </span>
              <span className="material-symbols-outlined" style={{ opacity: 0.3 }}>
                visibility
              </span>
            </div>

            {/* Preview Image */}
            <div style={{ aspectRatio: "4/5", backgroundColor: "var(--color-surface-container)", position: "relative", marginBottom: "24px", overflow: "hidden" }}>
              {originalPrice && Number(originalPrice.replace(/,/g, "")) > Number(price.replace(/,/g, "")) && (
                <div style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "var(--color-primary)", color: "white", padding: "4px 8px", fontSize: "11px", fontWeight: "bold", zIndex: 10, borderRadius: "2px" }}>
                  -{Math.round(((Number(originalPrice.replace(/,/g, "")) - Number(price.replace(/,/g, ""))) / Number(originalPrice.replace(/,/g, ""))) * 100)}%
                </div>
              )}
              {productImage ? (
                <img
                  alt="Live Preview"
                  src={productImage}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface-variant)", fontSize: "12px", textAlign: "center", padding: "16px" }}>
                  Image preview will appear here
                </div>
              )}
            </div>

            {/* Preview Content */}
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 className="card-title" style={{ fontSize: "20px", marginBottom: 0, lineHeight: "1.3" }}>
                {productName || "Product Name"}
              </h3>
              <p className="copyright" style={{ fontSize: "11px", color: "var(--color-on-surface-variant)" }}>
                {category.toUpperCase()}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {originalPrice && Number(originalPrice.replace(/,/g, "")) > Number(price.replace(/,/g, "")) && (
                  <p className="price-text" style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", textDecoration: "line-through", margin: 0 }}>
                    ₹{Number(originalPrice.replace(/,/g, "") || 0).toLocaleString()}
                  </p>
                )}
                <p className="price-text" style={{ fontSize: "18px", color: "var(--color-secondary)", margin: 0 }}>
                  ₹{Number(price.replace(/,/g, "") || 0).toLocaleString()}
                </p>
              </div>
              <div style={{ height: "1px", width: "48px", backgroundColor: "rgba(115, 92, 0, 0.3)", margin: "16px auto" }}></div>
              <button className="btn btn-outline" style={{ padding: "12px 24px", width: "100%" }} onClick={(e) => e.preventDefault()}>
                VIEW DETAILS
              </button>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div style={{ display: "flex", justifyContent: "space-around", backgroundColor: "var(--color-primary)", color: "white", padding: "16px 24px" }}>
            <div style={{ textAlign: "center" }}>
              <p className="copyright" style={{ fontSize: "9px", opacity: 0.6, margin: 0 }}>
                VIEWS
              </p>
              <p className="product-name" style={{ fontSize: "18px", color: "white", margin: 0 }}>
                1.2K
              </p>
            </div>
            <div style={{ width: "1px", backgroundColor: "rgba(255,255,255,0.1)" }}></div>
            <div style={{ textAlign: "center" }}>
              <p className="copyright" style={{ fontSize: "9px", opacity: 0.6, margin: 0 }}>
                CONV.
              </p>
              <p className="product-name" style={{ fontSize: "18px", color: "white", margin: 0 }}>
                3.4%
              </p>
            </div>
            <div style={{ width: "1px", backgroundColor: "rgba(255,255,255,0.1)" }}></div>
            <div style={{ textAlign: "center" }}>
              <p className="copyright" style={{ fontSize: "9px", opacity: 0.6, margin: 0 }}>
                REVENUE
              </p>
              <p className="product-name" style={{ fontSize: "18px", color: "white", margin: 0 }}>
                ₹4.2L
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ProductsListTable() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const filtered = products.filter(p => 
    (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="page-header" style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 className="page-title">Products Management</h2>
          <p className="page-subtitle">View, edit, and manage your jewelry catalog inventory.</p>
        </div>
        <Link href="/admin/products?id=new" style={{ textDecoration: "none" }}>
          <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "12px 24px" }} type="button">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
            ADD NEW PRODUCT
          </button>
        </Link>
      </header>

      <section className="card" style={{ padding: "24px" }}>
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="search-container" style={{ width: "100%", maxWidth: "320px" }}>
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              className="search-input"
              placeholder="Search products by name or SKU..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span style={{ fontSize: "13px", color: "var(--color-on-surface-variant)", fontWeight: "600" }}>{filtered.length} Items</span>
        </div>

        <div className="table-wrapper">
          {isLoading ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--color-primary)" }}>Loading catalog inventory...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--color-on-surface-variant)" }}>No products found matching your search.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>SKU</th>
                  <th>PRICE</th>
                  <th>STOCK</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const status = p.stock === 0 ? "OUT OF STOCK" : p.stock < 5 ? "LOW STOCK" : "IN STOCK";
                  const badgeClass = status === "IN STOCK" ? "badge-instock" : status === "LOW STOCK" ? "badge-lowstock" : "badge-outofstock";
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="product-cell" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div className="product-img" style={{ width: "44px", height: "44px", borderRadius: "6px", overflow: "hidden", flexShrink: 0 }}>
                            {p.image && isVideo(p.image) ? (
                              <video autoPlay loop muted playsInline src={p.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <img alt={p.name} src={p.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            )}
                          </div>
                          <div>
                            <p className="product-name" style={{ fontWeight: "600", margin: 0 }}>{p.name}</p>
                            <p className="product-cat" style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--color-on-surface-variant)", margin: 0 }}>{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: "13px", fontFamily: "monospace", color: "var(--color-on-surface-variant)" }}>{p.sku}</td>
                      <td style={{ fontWeight: "600", color: "var(--color-secondary)" }}>₹{(p.price || 0).toLocaleString()}</td>
                      <td>{p.stock}</td>
                      <td>
                        <span className={`status-badge ${badgeClass}`}>{status}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                          <Link href={`/product/${p.id}`} target="_blank" className="action-btn" title="View Storefront">
                            <span className="material-symbols-outlined">open_in_new</span>
                          </Link>
                          <Link href={`/admin/products?id=${p.id}`} className="action-btn" title="Edit Product">
                            <span className="material-symbols-outlined">edit</span>
                          </Link>
                          <button onClick={() => handleDelete(p.id, p.name)} className="action-btn" style={{ color: "#d32f2f", border: "none", background: "none", cursor: "pointer" }} title="Delete Product" type="button">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}

