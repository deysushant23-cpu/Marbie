"use client";

import React, { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { isVideo } from "@/lib/media";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import ReviewPromptPopup from "@/components/ReviewPromptPopup";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [manualReviewOpen, setManualReviewOpen] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  
  // Shipping states
  const [pincode, setPincode] = useState("");
  const [shippingResult, setShippingResult] = useState<any>(null);
  const [checkingShipping, setCheckingShipping] = useState(false);

  // Gifting state
  const [showGiftInput, setShowGiftInput] = useState(false);
  const [giftLocation, setGiftLocation] = useState("");

  // Similar Products state
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/config").then(res => res.json()).then(data => setConfig(data)).catch(err => console.error(err));
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Product not found");
        }
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        const productImages = data.images && data.images.length > 0 
          ? [data.image, ...data.images] 
          : [data.image];
        setImages(productImages);
        setSelectedImage(productImages[0]);
        setLoading(false);

        // Fetch similar products based on category
        if (data.category) {
          fetch(`/api/products?search=${encodeURIComponent(data.category)}`)
            .then(res => res.json())
            .then(simData => {
              // Exclude current product and take up to 4
              if (Array.isArray(simData)) {
                setSimilarProducts(simData.filter((p: any) => p.id !== data.id).slice(0, 4));
              }
            })
            .catch(err => console.error("Failed to fetch similar products", err));
        }
      })
      .catch((err) => {
        console.error(err);
        notFound();
      });
  }, [id]);

  // Auto-slide effect
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setSelectedImage(prev => {
        const currentIndex = images.indexOf(prev);
        const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
        return images[nextIndex];
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [images]);

  const handleCheckShipping = async () => {
    if (!pincode || pincode.length < 6) return;
    setCheckingShipping(true);
    setShippingResult(null);
    try {
      const res = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryPincode: pincode, weight: 0.5, orderAmount: product ? product.price : 0 })
      });
      const data = await res.json();
      setShippingResult(data);
    } catch (error) {
      console.error(error);
      setShippingResult({ error: "Failed to check delivery" });
    } finally {
      setCheckingShipping(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      weight: product.weight,
    });
    
    // Smooth visual feedback
    const btn = document.getElementById("add-to-bag-btn");
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="material-symbols-outlined">check</span> ADDED TO BAG`;
      btn.style.backgroundColor = "var(--color-secondary)";
      btn.style.color = "var(--color-on-secondary)";
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = "var(--color-primary)";
        btn.style.color = "var(--color-on-primary)";
      }, 2000);
    }
  };

  const handleGiftAddToCart = () => {
    if (!product || !giftLocation.trim()) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      weight: product.weight,
      isGift: true,
      giftLocation: giftLocation.trim()
    });
    
    // Smooth visual feedback
    const btn = document.getElementById("gift-btn-feedback");
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="material-symbols-outlined">check</span> ADDED AS GIFT`;
      btn.style.backgroundColor = "var(--color-secondary)";
      btn.style.color = "var(--color-on-secondary)";
      
      setTimeout(() => {
        setShowGiftInput(false);
        setGiftLocation("");
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <span className="material-symbols-outlined" style={{ animation: "spin 2s linear infinite", fontSize: "32px" }}>sync</span>
          <p style={{ letterSpacing: "0.15em", textTransform: "uppercase", fontSize: "14px" }}>{config?.labels?.productDetail?.loadingText || "Preparing Masterpiece..."}</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "120px", minHeight: "80vh" }}>
      
      {/* Breadcrumb Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: "32px", fontSize: "12px", letterSpacing: "0.1em", color: "var(--color-on-surface-variant)", textTransform: "uppercase" }}
      >
        <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "var(--color-primary)"} onMouseOut={e => e.currentTarget.style.color = "var(--color-on-surface-variant)"} onClick={() => router.push("/")}>Home</span>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "var(--color-primary)"} onMouseOut={e => e.currentTarget.style.color = "var(--color-on-surface-variant)"} onClick={() => router.push(`/${product.category}`)}>{product.category}</span>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>{product.name}</span>
      </motion.nav>

      <div className="product-detail-layout">
        
        {/* Left Side: Image Gallery */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "500px", width: "100%", margin: "0 auto" }}
        >
          
          {/* Main Image with Crossfade Animation */}
          <div 
            style={{ 
              width: "100%",
              aspectRatio: "1 / 1",
              backgroundColor: "var(--color-surface-container)", 
              overflow: "hidden", 
              position: "relative",
              borderRadius: "8px",
              border: "1px solid var(--color-outline-variant)"
            }}
          >
            {/* Left Arrow */}
            {images.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = images.indexOf(selectedImage);
                  const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
                  setSelectedImage(images[prevIndex]);
                }}
                style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ddd", cursor: "pointer", zIndex: 20, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
              >
                <span className="material-symbols-outlined" style={{ color: "#333" }}>chevron_left</span>
              </button>
            )}

            {/* Crossfade Media */}
            <AnimatePresence mode="wait">
              {isVideo(selectedImage) ? (
                <motion.video 
                  key={selectedImage}
                  src={selectedImage} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ 
                    position: "absolute",
                    inset: 0,
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover" 
                  }} 
                />
              ) : (
                <motion.div 
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ 
                    position: "absolute",
                    inset: 0,
                    width: "100%", 
                    height: "100%"
                  }} 
                >
                  <Image src={selectedImage} alt={`${product.name} view`} fill style={{ objectFit: "cover" }} quality={100} priority />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right Arrow */}
            {images.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = images.indexOf(selectedImage);
                  const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
                  setSelectedImage(images[nextIndex]);
                }}
                style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ddd", cursor: "pointer", zIndex: 20, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
              >
                <span className="material-symbols-outlined" style={{ color: "#333" }}>chevron_right</span>
              </button>
            )}
          </div>

          {/* Horizontal Thumbnails */}
          <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px", scrollbarWidth: "thin" }}>
            {images.map((img, index) => (
              <motion.div 
                key={index} 
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedImage(img)}
                style={{ 
                  position: "relative",
                  width: "72px", 
                  height: "72px", 
                  flexShrink: 0,
                  border: selectedImage === img && index === images.indexOf(selectedImage) ? "2px solid var(--color-primary)" : "1px solid var(--color-outline-variant)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  backgroundColor: "var(--color-surface-container)",
                  overflow: "hidden",
                  opacity: selectedImage === img && index === images.indexOf(selectedImage) ? 1 : 0.7,
                  transition: "all 0.2s ease"
                }}
              >
                {isVideo(img) ? (
                  <video 
                    src={img} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover",
                    }} 
                  />
                ) : (
                  <Image 
                    src={img} 
                    alt={`${product.name} view ${index + 1}`} 
                    fill
                    style={{ objectFit: "cover" }} 
                    quality={90}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ display: "flex", flexDirection: "column" }}
        >
          {product.badge && (
            <span style={{ fontSize: "12px", letterSpacing: "0.15em", color: "var(--color-secondary)", textTransform: "uppercase", marginBottom: "16px", fontWeight: 600 }}>
              {product.badge}
            </span>
          )}
          
          <h1 style={{ fontSize: "36px", color: "var(--color-primary)", marginBottom: "16px", fontFamily: "var(--font-serif)", lineHeight: 1.2 }}>
            {product.name}
          </h1>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
            {product.originalPrice && product.originalPrice > product.price && (
              <p style={{ fontSize: "18px", color: "var(--color-on-surface-variant)", textDecoration: "line-through", fontWeight: 400, margin: 0 }}>
                ₹{product.originalPrice.toLocaleString()}
              </p>
            )}
            <p style={{ fontSize: "24px", color: "var(--color-on-surface)", fontWeight: 500, margin: 0 }}>
              ₹{product.price.toLocaleString()}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <span style={{ backgroundColor: "var(--color-primary)", color: "white", padding: "4px 8px", fontSize: "12px", fontWeight: "bold", borderRadius: "4px" }}>
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </span>
            )}
          </div>

          <div className="section-divider" style={{ marginBottom: "32px" }}></div>

          <p style={{ fontSize: "16px", color: "var(--color-on-surface-variant)", lineHeight: 1.8, marginBottom: "40px" }}>
            {product.description || config?.labels?.productDetail?.fallbackDesc || "An exquisite piece crafted with unparalleled attention to detail."}
          </p>

          {/* Details Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "48px", backgroundColor: "rgba(var(--color-surface-container-rgb), 0.3)", padding: "24px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}
          >
            <div>
              <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Dimensions</p>
              <p style={{ fontSize: "15px", color: "var(--color-primary)", fontWeight: 500 }}>{product.dimensions || "N/A"}</p>
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Weight</p>
              <p style={{ fontSize: "15px", color: "var(--color-primary)", fontWeight: 500 }}>{product.weight || "N/A"}</p>
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Availability</p>
              <p style={{ fontSize: "15px", color: "var(--color-primary)", fontWeight: 500 }}>
                {product.stock > 0 ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ display: "inline-block", width: "8px", height: "8px", backgroundColor: "#4CAF50", borderRadius: "50%", boxShadow: "0 0 8px rgba(76, 175, 80, 0.4)" }}></span> In Stock</span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ display: "inline-block", width: "8px", height: "8px", backgroundColor: "#f44336", borderRadius: "50%", boxShadow: "0 0 8px rgba(244, 67, 54, 0.4)" }}></span> Made to Order</span>
                )}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>SKU</p>
              <p style={{ fontSize: "15px", color: "var(--color-primary)", fontWeight: 500 }}>{product.sku || "N/A"}</p>
            </div>
          </motion.div>

          {/* Delivery & Logistics Widget */}
          <div style={{ marginBottom: "32px", padding: "24px", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "8px" }}>
            <h3 style={{ fontSize: "14px", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined">local_shipping</span>
              Check Delivery Eligibility
            </h3>
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <input 
                type="text" 
                placeholder="Enter 6-digit PIN code" 
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                style={{ flex: 1, padding: "12px 16px", borderRadius: "4px", border: "1px solid var(--color-outline-variant)", outline: "none", fontSize: "14px" }}
              />
              <button 
                onClick={handleCheckShipping}
                disabled={checkingShipping || pincode.length < 6}
                style={{ padding: "0 24px", backgroundColor: "var(--color-secondary)", color: "white", border: "none", borderRadius: "4px", fontWeight: 600, cursor: checkingShipping || pincode.length < 6 ? "not-allowed" : "pointer", opacity: checkingShipping || pincode.length < 6 ? 0.7 : 1 }}
              >
                {checkingShipping ? "CHECKING..." : "CHECK"}
              </button>
            </div>
            
            {shippingResult && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "12px", backgroundColor: shippingResult.serviceable ? "rgba(46, 125, 50, 0.1)" : "rgba(211, 47, 47, 0.1)", borderRadius: "4px" }}>
                {shippingResult.serviceable ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <p style={{ color: "#2e7d32", margin: 0, fontWeight: 600, fontSize: "14px" }}>✓ Delivery Available</p>
                      <span style={{ fontSize: "12px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: shippingResult.shippingFee === 0 ? "rgba(6, 59, 47, 0.15)" : "rgba(0,0,0,0.05)", color: shippingResult.shippingFee === 0 ? "#063b2f" : "#4a5550" }}>
                        {shippingResult.shippingFee === 0 ? "🎉 FREE Express Shipping (> ₹1,499)" : `Shipping: ₹${shippingResult.shippingFee}`}
                      </span>
                    </div>
                    <p style={{ color: "var(--color-on-surface-variant)", margin: 0, fontSize: "13px" }}>
                      Expected Delivery by <strong style={{ color: "var(--color-primary)" }}>{new Date(shippingResult.estimatedDeliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong> 
                      &nbsp;({shippingResult.days} days) via {shippingResult.courier}
                    </p>
                  </div>
                ) : (
                  <p style={{ color: "#d32f2f", margin: 0, fontWeight: 500, fontSize: "14px" }}>
                    {shippingResult.error || "Sorry, we do not deliver to this PIN code yet."}
                  </p>
                )}
              </motion.div>
            )}
          </div>

          <motion.button 
            id="add-to-bag-btn"
            className="btn-primary mobile-sticky-cart" 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            style={{ padding: "20px 32px", fontSize: "14px", letterSpacing: "0.15em", textTransform: "uppercase", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", transition: "background-color 0.3s ease, color 0.3s ease", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            {config?.labels?.productDetail?.addToBag || "ADD TO BAG"}
          </motion.button>

          {/* GIFT BUTTON */}
          {!showGiftInput ? (
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: "var(--color-primary)", color: "var(--color-surface)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowGiftInput(true)}
              style={{ marginTop: "16px", padding: "16px 32px", fontSize: "14px", letterSpacing: "0.1em", textTransform: "uppercase", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", backgroundColor: "transparent", color: "var(--color-primary)", border: "1px solid var(--color-primary)", cursor: "pointer", borderRadius: "8px", transition: "all 0.2s" }}
            >
              <span className="material-symbols-outlined">featured_seasonal_and_gifts</span>
              SEND AS A GIFT
            </motion.button>
          ) : (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: "16px", padding: "16px", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-primary)", borderRadius: "8px" }}>
              <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "var(--color-primary)", fontWeight: 600 }}>Where are we sending this gift?</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <input 
                  type="text" 
                  value={giftLocation}
                  onChange={(e) => setGiftLocation(e.target.value)}
                  placeholder="Enter Delivery Address or PIN"
                  style={{ flex: 1, padding: "12px", border: "1px solid var(--color-outline-variant)", borderRadius: "4px", outline: "none", fontSize: "14px" }}
                />
                <button 
                  id="gift-btn-feedback"
                  onClick={handleGiftAddToCart}
                  disabled={!giftLocation.trim()}
                  style={{ padding: "0 24px", backgroundColor: "var(--color-primary)", color: "white", border: "none", borderRadius: "4px", cursor: giftLocation.trim() ? "pointer" : "not-allowed", opacity: giftLocation.trim() ? 1 : 0.7, fontWeight: 600 }}
                >
                  ADD
                </button>
              </div>
              <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "var(--color-on-surface-variant)", fontStyle: "italic" }}>Note: Gifts can only be purchased via Online Payment.</p>
              <button onClick={() => setShowGiftInput(false)} style={{ marginTop: "12px", background: "none", border: "none", color: "var(--color-on-surface-variant)", fontSize: "12px", textDecoration: "underline", cursor: "pointer" }}>Cancel</button>
            </motion.div>
          )}

        </motion.div>
      </div>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div style={{ marginTop: "80px", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "24px", color: "var(--color-primary)", fontFamily: "var(--font-serif)", textAlign: "center", marginBottom: "32px", textTransform: "uppercase", letterSpacing: "0.1em" }}>You May Also Like</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
            {similarProducts.map((p, i) => (
              <motion.div 
                key={p.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
                onClick={() => router.push(`/product/${p.id}`)} 
                style={{ cursor: "pointer", border: "1px solid var(--color-outline-variant)", borderRadius: "12px", overflow: "hidden", backgroundColor: "var(--color-surface)", transition: "box-shadow 0.3s ease" }}
              >
                <div style={{ position: "relative", width: "100%", aspectRatio: "4/5", backgroundColor: "var(--color-surface-container)" }}>
                  <Image src={p.image || (p.images && p.images[0])} alt={p.name} fill style={{ objectFit: "cover" }} />
                </div>
                <div style={{ padding: "16px", textAlign: "center" }}>
                  <h3 style={{ fontSize: "14px", color: "var(--color-primary)", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>{p.name}</h3>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-on-surface)", margin: 0 }}>₹{p.price.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Product Reviews Section with Write Review Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "48px", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <h3 style={{ fontSize: "20px", color: "var(--color-primary)", fontFamily: "var(--font-serif)", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Royal Customer Reviews</h3>
        <button 
          onClick={() => setManualReviewOpen(true)}
          className="btn-primary hover-scale"
          style={{ width: "auto", padding: "12px 24px", backgroundColor: "var(--color-secondary)", color: "#ffffff", border: "none", display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>star</span>
          WRITE A ROYAL REVIEW
        </button>
      </div>

      <ReviewsCarousel filterProduct={product.name} />

      <ReviewPromptPopup
        isOpen={manualReviewOpen}
        onClose={() => setManualReviewOpen(false)}
        productName={product.name}
        productImage={product.image || (product.images?.[0]) || ""}
      />
    </div>
  );
}
