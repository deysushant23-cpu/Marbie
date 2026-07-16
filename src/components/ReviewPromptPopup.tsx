"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export interface ReviewPromptPopupProps {
  isOpen?: boolean;
  onClose?: () => void;
  orderId?: string;
  productName?: string;
  productImage?: string;
  onReviewSubmitted?: (newReview: any) => void;
}

export default function ReviewPromptPopup({
  isOpen: propIsOpen,
  onClose: propOnClose,
  orderId: propOrderId,
  productName: propProductName,
  productImage: propProductImage,
  onReviewSubmitted
}: ReviewPromptPopupProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string>("");
  const [activeProductName, setActiveProductName] = useState<string>("");
  const [activeProductImage, setActiveProductImage] = useState<string>("");

  // Form states
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [author, setAuthor] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>("/images/Beautiful_Indian_woman_with_soft_202606232200.jpeg");
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Sync prop or query parameters
  useEffect(() => {
    const isPromptUrl = searchParams.get("reviewPrompt") === "true";
    const queryOrderId = searchParams.get("orderId") || "";
    const queryProduct = searchParams.get("product") || "";
    const queryImage = searchParams.get("image") || "";

    if (propIsOpen !== undefined) {
      setIsOpen(propIsOpen);
      if (propOrderId) setActiveOrderId(propOrderId);
      if (propProductName) setActiveProductName(propProductName);
      if (propProductImage) setActiveProductImage(propProductImage);
    } else if (isPromptUrl) {
      setIsOpen(true);
      if (queryOrderId) setActiveOrderId(queryOrderId);
      if (queryProduct) setActiveProductName(queryProduct);
      if (queryImage) setActiveProductImage(queryImage);

      // Try looking up the order from localStorage if product name wasn't in URL
      if (queryOrderId && !queryProduct && typeof window !== "undefined") {
        try {
          const savedHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
          const found = savedHistory.find((o: any) => o.id === queryOrderId || o.id === `#ORD-${queryOrderId}`);
          if (found && found.items && found.items.length > 0) {
            setActiveProductName(found.items[0].name);
            setActiveProductImage(found.items[0].image);
            if (found.shippingAddress?.fullName && !author) {
              setAuthor(found.shippingAddress.fullName);
            }
          }
        } catch (e) {
          console.error("Error looking up order in localHistory for review prompt", e);
        }
      }
    } else if (typeof window !== "undefined") {
      try {
        const savedHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
        const unreviewedDelivered = savedHistory.find((o: any) => {
          const status = (o.status || "").toUpperCase();
          if (status !== "DELIVERED" || !o.items || o.items.length === 0) return false;
          const item = o.items[0];
          const isReviewed = localStorage.getItem(`reviewed_order_${o.id}_${item.name}`) === "true";
          const isDismissed = sessionStorage.getItem(`dismissed_review_prompt_${o.id}`) === "true";
          return !isReviewed && !isDismissed;
        });

        if (unreviewedDelivered && unreviewedDelivered.items?.[0]) {
          const item = unreviewedDelivered.items[0];
          const timer = setTimeout(() => {
            setActiveOrderId(unreviewedDelivered.id);
            setActiveProductName(item.name);
            setActiveProductImage(item.image);
            if (unreviewedDelivered.shippingAddress?.fullName) {
              setAuthor(unreviewedDelivered.shippingAddress.fullName);
            }
            setIsOpen(true);
          }, 1200);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.error("Error auto-checking unreviewed DELIVERED orders", e);
      }
    }
  }, [propIsOpen, propOrderId, propProductName, propProductImage, searchParams]);

  const handleClose = () => {
    setIsOpen(false);
    if (propOnClose) propOnClose();
    if (activeOrderId && typeof window !== "undefined") {
      sessionStorage.setItem(`dismissed_review_prompt_${activeOrderId}`, "true");
    }

    // If opened via URL query parameter, clean up URL without reloading page
    if (searchParams.get("reviewPrompt") === "true") {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("reviewPrompt");
      const newUrl = `${pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`;
      router.replace(newUrl, { scroll: false });
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 1: return "Needs Improvement";
      case 2: return "Average";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Royal Perfection! ✨";
      default: return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("Please enter your valuable review feedback!");
      return;
    }

    setSubmitting(true);
    const reviewAuthor = author.trim() || "Verified Royal Customer";
    const reviewTitle = title.trim() || (rating === 5 ? "Exquisite Quality & Royal Shine! ✨" : "Good Experience with Marbie");
    const targetProduct = activeProductName || "Marbie Fine Jewelry";

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE",
          author: reviewAuthor,
          title: reviewTitle,
          content: content.trim(),
          rating: Number(rating),
          product: targetProduct,
          image: photoUrl || "/images/Beautiful_Indian_woman_with_soft_202606232200.jpeg",
          verified: true
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedSuccess(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("review-submitted"));
          if (activeOrderId && targetProduct) {
            localStorage.setItem(`reviewed_order_${activeOrderId}_${targetProduct}`, "true");
          }
        }
        if (onReviewSubmitted && data.review) {
          onReviewSubmitted(data.review);
        }
        setTimeout(() => {
          setSubmittedSuccess(false);
          handleClose();
          // Reset form
          setContent("");
          setTitle("");
        }, 2000);
      } else {
        alert(data.error || "Could not save review. Please try again.");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Network error while submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(6px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(12px, 3vw, 24px)"
        }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 30 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "var(--color-surface, #ffffff)",
            borderRadius: "16px",
            border: "1px solid var(--color-outline-variant, #e2e8f0)",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.3)",
            width: "100%",
            maxWidth: "520px",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative",
            color: "var(--color-on-surface, #1e293b)",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Top Ekart Delivery Banner */}
          <div 
            style={{
              background: "linear-gradient(135deg, var(--color-primary, #0f172a) 0%, #1e293b 100%)",
              color: "#ffffff",
              padding: "clamp(16px, 4vw, 24px)",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Subtle background glow effect */}
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", background: "radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
            
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                cursor: "pointer",
                transition: "background 0.2s"
              }}
              title="Close"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span className="material-symbols-outlined" style={{ color: "#4CAF50", fontSize: "24px" }}>local_shipping</span>
              <span style={{ fontSize: "clamp(11px, 2.5vw, 13px)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "#cbd5e1" }}>
                EKART LOGISTICS • DELIVERED
              </span>
            </div>
            <h3 style={{ fontSize: "clamp(18px, 4vw, 22px)", fontFamily: "var(--font-serif, serif)", fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>
              How is your new masterpiece?
            </h3>
            {activeOrderId && (
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0 0" }}>Order #{activeOrderId.replace(/^#/, "")}</p>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: "clamp(16px, 4vw, 28px)", flex: 1 }}>
            {submittedSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center", padding: "32px 16px" }}
              >
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(76, 175, 80, 0.15)", color: "#4CAF50", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "36px" }}>check_circle</span>
                </div>
                <h4 style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-primary, #0f172a)", marginBottom: "8px" }}>
                  Thank You, Royalty! ✨
                </h4>
                <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant, #64748b)", lineHeight: 1.5 }}>
                  Your review has been verified and published directly to the overview section of <strong>{activeProductName || "this product"}</strong>!
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Product Preview Bar */}
                {(activeProductName || activeProductImage) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px", backgroundColor: "var(--color-surface-container, #f8fafc)", borderRadius: "10px", border: "1px solid var(--color-outline-variant, #f1f5f9)" }}>
                    {activeProductImage ? (
                      <img src={activeProductImage} alt={activeProductName} style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "8px" }} />
                    ) : (
                      <div style={{ width: "56px", height: "56px", borderRadius: "8px", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="material-symbols-outlined" style={{ color: "#64748b" }}>diamond</span>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-on-surface-variant, #64748b)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px 0" }}>Rate This Item</p>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-primary, #0f172a)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {activeProductName || "Marbie Royal Jewelry"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Star Rating Section (Interactive & Meesho style) */}
                <div style={{ textAlign: "center", padding: "8px 0" }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-primary, #0f172a)", marginBottom: "12px" }}>
                    Tap stars to rate your overall experience
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || rating) >= star;
                      return (
                        <motion.button
                          key={star}
                          type="button"
                          whileHover={{ scale: 1.25, rotate: 6 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            color: isFilled ? "#f59e0b" : "#cbd5e1",
                            transition: "color 0.15s ease"
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "clamp(32px, 8vw, 42px)", fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0" }}>
                            star
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                  <motion.p
                    key={hoverRating || rating}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: "14px", fontWeight: 700, color: "#f59e0b", marginTop: "8px", minHeight: "20px" }}
                  >
                    {getRatingLabel(hoverRating || rating)}
                  </motion.p>
                </div>

                {/* Review Headline & Content */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-on-surface-variant, #64748b)", marginBottom: "6px" }}>
                    Review Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={rating === 5 ? "e.g. Absolutely stunning! Royal bridal shine ✨" : "e.g. Good quality product"}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-outline-variant, #cbd5e1)",
                      outline: "none",
                      fontSize: "14px",
                      backgroundColor: "var(--color-surface, #ffffff)",
                      color: "var(--color-on-surface, #0f172a)",
                      transition: "border-color 0.2s"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-on-surface-variant, #64748b)", marginBottom: "6px" }}>
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tell us about the shine, craftsmanship, packaging, or how you styled it..."
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-outline-variant, #cbd5e1)",
                      outline: "none",
                      fontSize: "14px",
                      resize: "vertical",
                      backgroundColor: "var(--color-surface, #ffffff)",
                      color: "var(--color-on-surface, #0f172a)",
                      fontFamily: "inherit"
                    }}
                  />
                </div>

                {/* Author Field */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-on-surface-variant, #64748b)", marginBottom: "6px" }}>
                    Your Name (as displayed to others)
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Ananya S. (Verified Buyer)"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-outline-variant, #cbd5e1)",
                      outline: "none",
                      fontSize: "14px",
                      backgroundColor: "var(--color-surface, #ffffff)",
                      color: "var(--color-on-surface, #0f172a)"
                    }}
                  />
                </div>

                {/* Optional Photo Attachment */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPhotoInput(!showPhotoInput)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-secondary, #b45309)",
                      fontSize: "13px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add_photo_alternate</span>
                    {showPhotoInput ? "Hide Photo Option" : "Add Photo / Wearing Picture (+ ⭐️ Feature Eligibility)"}
                  </button>

                  {showPhotoInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      style={{ marginTop: "10px", padding: "12px", backgroundColor: "var(--color-surface-container, #f8fafc)", borderRadius: "8px", border: "1px dashed #cbd5e1" }}
                    >
                      <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant, #64748b)", margin: "0 0 8px 0" }}>
                        Enter Image URL of your wearing picture or bridal look:
                      </p>
                      <input
                        type="text"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="https://... or /images/..."
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                          outline: "none"
                        }}
                      />
                    </motion.div>
                  )}
                </div>

                {/* Submit Action */}
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.01 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  style={{
                    padding: "16px",
                    backgroundColor: "var(--color-primary, #0f172a)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.75 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.25)",
                    marginTop: "8px"
                  }}
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-outlined" style={{ animation: "spin 1.5s linear infinite", fontSize: "18px" }}>sync</span>
                      PUBLISHING REVIEW...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>send</span>
                      SUBMIT ROYAL REVIEW
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
