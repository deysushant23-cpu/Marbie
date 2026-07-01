"use client";

import React, { useState, useEffect } from "react";

export interface ReviewItem {
  id: number;
  title: string;
  author: string;
  time: string;
  rating: number;
  content: string;
  criticism?: string;
  product: string;
  verified: boolean;
  isFeatured?: boolean;
  image: string;
}

export default function ReviewsCarousel({ 
  title,
  filterProduct
}: { 
  title?: string;
  filterProduct?: string;
}) {
  const displayTitle = title || (filterProduct ? "PRODUCT REVIEWS" : "THAT'S WHAT THEY SAID");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [criticism, setCriticism] = useState("");
  const [rating, setRating] = useState(5);
  const [avatarUrl, setAvatarUrl] = useState("/images/Beautiful_Indian_woman_with_soft_202606232200.jpeg");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/reviews")
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          if (filterProduct) {
            const matched = data.filter(r => r.product && (
              r.product.toLowerCase() === filterProduct.toLowerCase() ||
              r.product.toLowerCase().includes(filterProduct.toLowerCase()) ||
              filterProduct.toLowerCase().includes(r.product.toLowerCase())
            )).filter(r => r.id > 1000); // Exclude seeded dummy reviews (IDs 101-105)
            setReviews(matched);
          } else {
            const featured = data.filter(r => r.isFeatured);
            setReviews(featured);
          }
        }
      })
      .catch(err => console.error("Error fetching reviews:", err));
  }, [filterProduct]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !content) return alert("Please enter your name and review text.");
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE",
          author,
          content,
          criticism,
          rating,
          product: filterProduct || "Marbie Fine Jewelry",
          image: avatarUrl
        })
      });
      const result = await res.json();
      if (result.success && result.review) {
        setReviews([result.review, ...reviews]);
        setShowModal(false);
        setAuthor("");
        setContent("");
        setCriticism("");
        alert("Thank you! Your royal review has been posted.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  // Duplicate list to achieve infinite seamless looping
  const displayList = reviews.length > 0 ? [...reviews, ...reviews] : [];

  if (!filterProduct && reviews.length === 0) return null;

  return (
    <section style={{ padding: "72px 0", backgroundColor: "var(--color-surface)", overflow: "hidden" }}>
      <div className="container">
        {/* Title Header Matching Reference */}
        <div className="reviews-header-container" style={{ textAlign: "center", marginBottom: "44px" }}>
          <h2 style={{ 
            fontFamily: "var(--font-display)", 
            fontSize: "30px", 
            fontWeight: 700, 
            letterSpacing: "0.28em", 
            color: "var(--color-on-surface)", 
            margin: "0 0 16px 0",
            textTransform: "uppercase" 
          }}>
            {displayTitle}
          </h2>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", color: "var(--color-primary)" }}>
            <span style={{ height: "1px", width: "90px", backgroundColor: "rgba(0,36,27,0.2)" }}></span>
            <span style={{ fontSize: "18px" }}>❧ ✿ ❧</span>
            <span style={{ height: "1px", width: "90px", backgroundColor: "rgba(0,36,27,0.2)" }}></span>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="btn-secondary reviews-write-btn"
            type="button"
          >
            + WRITE A REVIEW
          </button>
        </div>
      </div>

      {/* Slowly Sliding Marquee Track */}
      <div className="reviews-marquee-wrap">
        {reviews.length > 0 ? (
          <div className="reviews-marquee-track">
            {displayList.map((rev, rIdx) => (
              <div key={`${rev.id}-${rIdx}`} className="review-slide-card">
                {/* Top Left Rose Stars */}
                <div style={{ width: "100%", textAlign: "left", marginBottom: "12px", color: "#df8d93", fontSize: "16px", letterSpacing: "3px" }}>
                  {"★".repeat(rev.rating || 5)}
                </div>

                {/* Customer Circular Avatar */}
                <div style={{ width: "76px", height: "76px", borderRadius: "50%", overflow: "hidden", margin: "8px auto 16px auto", border: "2px solid #f3e5d8", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}>
                  <img 
                    src={rev.image || "/images/Beautiful_Indian_woman_with_soft_202606232200.jpeg"} 
                    alt={rev.author} 
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
                  />
                </div>

                {/* Quote Quote */}
                <p style={{ fontSize: "13.5px", color: "#374151", lineHeight: 1.65, fontStyle: "normal", margin: "0 0 12px 0", flex: 1 }}>
                  {rev.criticism ? <><span style={{ fontWeight: 600, color: "var(--color-primary)" }}>Compliment:</span> </> : null}
                  "{rev.content}"
                </p>
                {rev.criticism && (
                  <p style={{ fontSize: "13.5px", color: "#374151", lineHeight: 1.65, fontStyle: "normal", margin: "0 0 20px 0", flex: 1 }}>
                    <span style={{ fontWeight: 600, color: "var(--color-error)" }}>Criticism:</span> "{rev.criticism}"
                  </p>
                )}
                {!rev.criticism && <div style={{ marginBottom: "20px" }}></div>}

                {/* Author Name */}
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "0.05em" }}>
                  {rev.author}
                </h4>
                {rev.verified && (
                  <span style={{ fontSize: "10px", color: "var(--color-primary)", fontWeight: 600, letterSpacing: "0.1em", marginTop: "4px", textTransform: "uppercase" }}>
                    Verified Buyer
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--color-on-surface-variant)", fontStyle: "italic", border: "1px dashed var(--color-outline-variant)", borderRadius: "16px", maxWidth: "560px", margin: "16px auto", background: "var(--color-surface-container)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "40px", display: "block", margin: "0 auto 12px auto", color: "var(--color-primary)", opacity: 0.6 }}>history_edu</span>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--color-on-surface)", fontStyle: "normal" }}>No royal reviews yet for {filterProduct}.</p>
            <p style={{ margin: "6px 0 0 0", fontSize: "13px", fontStyle: "normal" }}>Be the first to share your experience by clicking "+ WRITE A REVIEW" above!</p>
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", maxWidth: "480px", width: "100%", padding: "32px", position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#666" }}
              type="button"
            >
              ✕
            </button>

            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-primary)", margin: "0 0 6px 0", textAlign: "center", fontFamily: "var(--font-display)" }}>
              Share Your Royal Experience
            </h3>
            <p style={{ fontSize: "13px", color: "#666", textAlign: "center", margin: "0 0 24px 0" }}>
              {filterProduct ? `Reviewing ${filterProduct}` : "We would love to hear from you."}
            </p>

            <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px", color: "#333" }}>Your Name</label>
                <input 
                  type="text"
                  required
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="e.g. Aarti Sharma"
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px", color: "#333" }}>Rating</label>
                <div style={{ display: "flex", gap: "8px", fontSize: "24px", cursor: "pointer", color: "#df8d93" }}>
                  {[1,2,3,4,5].map(st => (
                    <span key={st} onClick={() => setRating(st)}>
                      {st <= rating ? "★" : "☆"}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px", color: "#333" }}>Your Review Quote</label>
                <textarea 
                  required
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Tell us what you loved about the design, quality, or bridal look..."
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px", color: "#333" }}>Constructive Criticism (Optional)</label>
                <textarea 
                  rows={2}
                  value={criticism}
                  onChange={e => setCriticism(e.target.value)}
                  placeholder="Anything we can improve?"
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px", color: "#333" }}>Upload Image</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append("file", file);
                      const res = await fetch("/api/upload", { method: "POST", body: formData });
                      const result = await res.json();
                      if (result.success) setAvatarUrl(result.url);
                    }
                  }}
                  style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px" }}
                />
                {avatarUrl && avatarUrl !== "/images/Beautiful_Indian_woman_with_soft_202606232200.jpeg" && (
                  <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--color-primary)", fontWeight: 600 }}>Image uploaded successfully.</div>
                )}
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ padding: "14px", fontSize: "13px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "8px" }}
              >
                {submitting ? "POSTING..." : "SUBMIT REVIEW"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
