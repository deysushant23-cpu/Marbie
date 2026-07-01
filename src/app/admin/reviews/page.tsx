"use client";

import React, { useState } from "react";

interface ReviewItem {
  id: number;
  title: string;
  author: string;
  time: string;
  rating: number;
  content: string;
  product: string;
  verified: boolean;
  flagged?: boolean;
  isFeatured?: boolean;
  criticism?: string;
  image: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch((err) => console.error("Failed to fetch reviews:", err));
  }, []);

  const handleApprove = (id: number) => {
    fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "APPROVE" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReviews((prev) => prev.map((r) => r.id === id ? data.review : r));
        }
      })
      .catch((err) => console.error(err));
  };

  const handleFeature = (id: number, currentFeatureStatus: boolean) => {
    fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: currentFeatureStatus ? "UNFEATURE" : "FEATURE" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReviews((prev) => prev.map((r) => r.id === id ? data.review : r));
        }
      })
      .catch((err) => console.error(err));
  };

  const handleDismiss = (id: number) => {
    fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "DISMISS" }),
    })
      .then((res) => res.json())
      .then(() => {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      })
      .catch((err) => console.error(err));
  };

  const filteredReviews = reviews.filter(
    (r) =>
      (r.content || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.product || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.author || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const positivePercentage = reviews.length > 0 ? Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100) : 0;

  return (
    <>
      {/* Top Header */}
      <header className="page-header" style={{ borderBottom: "1px solid rgba(192, 200, 196, 0.1)", paddingBottom: "24px", marginBottom: "48px" }}>
        <div>
          <h2 className="page-title">Customer Reviews</h2>
          <p className="page-subtitle" style={{ textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.15em", color: "var(--color-on-surface-variant)" }}>
            Moderation Queue
          </p>
        </div>
        <div className="header-actions">
          <div className="search-container">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              className="search-input"
              placeholder="Search comments..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Metrics Bar */}
      <section className="stats-grid" style={{ marginBottom: "64px" }}>
        <div className="stat-card" style={{ borderLeft: "2px solid var(--color-secondary)" }}>
          <div>
            <span className="stat-label">AVERAGE RATING</span>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
              <h3 className="stat-value" style={{ fontSize: "40px", lineHeight: "1" }}>
                {avgRating}
              </h3>
              <div style={{ display: "flex", color: "var(--color-secondary)", marginBottom: "4px" }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: "2px solid var(--color-primary)" }}>
          <div>
            <span className="stat-label">PENDING APPROVAL</span>
            <h3 className="stat-value" style={{ fontSize: "40px", lineHeight: "1" }}>
              {reviews.filter(r => r.flagged).length}
            </h3>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: "2px solid var(--color-outline)" }}>
          <div>
            <span className="stat-label">TOTAL REVIEWS</span>
            <h3 className="stat-value" style={{ fontSize: "40px", lineHeight: "1" }}>
              {reviews.length}
            </h3>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: "2px solid var(--color-primary-fixed-dim)" }}>
          <div>
            <span className="stat-label">SENTIMENT</span>
            <h3 className="stat-value" style={{ fontSize: "40px", lineHeight: "1" }}>
              {positivePercentage}%{" "}
              <span className="copyright" style={{ textTransform: "lowercase", display: "inline" }}>
                Positive
              </span>
            </h3>
          </div>
        </div>
      </section>

      {/* Reviews Queue Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1024px", margin: "0 auto" }}>
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "24px",
                padding: "32px",
                borderLeft: review.flagged ? "4px solid var(--color-error)" : "1px solid rgba(212, 175, 55, 0.15)",
                backgroundColor: review.flagged ? "rgba(186, 26, 26, 0.03)" : "white",
                position: "relative",
              }}
            >
              <div className="hide-mobile" style={{ flexShrink: 0 }}>
                <div style={{ width: "64px", height: "64px", border: "1px solid rgba(192, 200, 196, 0.2)", overflow: "hidden" }}>
                  <img
                    alt={review.product}
                    src={review.image}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>

              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h4 className="product-name" style={{ fontSize: "20px", margin: 0 }}>
                        &quot;{review.title}&quot;
                      </h4>
                      {review.flagged && (
                        <span
                          className="copyright"
                          style={{
                            backgroundColor: "var(--color-error)",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: "2px",
                          }}
                        >
                          FLAGGED
                        </span>
                      )}
                    </div>
                    <p className="copyright" style={{ marginTop: "4px", color: "var(--color-on-surface-variant)" }}>
                      BY {review.author} • {review.time}
                    </p>
                  </div>
                  <div style={{ display: "flex", color: "var(--color-secondary)" }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className="material-symbols-outlined"
                        style={{
                          fontVariationSettings: s <= review.rating ? "'FILL' 1" : "'FILL' 0",
                          fontSize: "16px",
                        }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>

                <p
                  style={{
                    fontStyle: "italic",
                    color: "var(--color-on-surface-variant)",
                    lineHeight: "1.8",
                    marginBottom: "12px",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>Compliment:</span> &quot;{review.content}&quot;
                </p>
                
                {review.criticism && (
                  <p
                    style={{
                      fontStyle: "italic",
                      color: "var(--color-on-surface-variant)",
                      lineHeight: "1.8",
                      marginBottom: "24px",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "var(--color-error)" }}>Criticism:</span> &quot;{review.criticism}&quot;
                  </p>
                )}
                {!review.criticism && <div style={{ marginBottom: "24px" }}></div>}

                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <span
                    className="copyright"
                    style={{
                      fontSize: "10px",
                      backgroundColor: "var(--color-surface-container)",
                      padding: "4px 12px",
                      borderRadius: "16px",
                    }}
                  >
                    Product: {review.product}
                  </span>
                  {review.verified && (
                    <span
                      className="copyright"
                      style={{
                        fontSize: "10px",
                        backgroundColor: "rgba(115, 92, 0, 0.1)",
                        color: "var(--color-secondary)",
                        padding: "4px 12px",
                        borderRadius: "16px",
                        border: "1px solid rgba(115, 92, 0, 0.2)",
                      }}
                    >
                      Verified Purchase
                    </span>
                  )}
                </div>
              </div>

              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  justifyContent: "center",
                  borderLeft: "1px solid rgba(192, 200, 196, 0.1)",
                  paddingLeft: "24px",
                }}
              >
                {!review.flagged ? (
                  <>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleFeature(review.id, review.isFeatured || false)}
                      style={{
                        width: "128px",
                        padding: "10px",
                        fontSize: "11px",
                        borderRadius: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        backgroundColor: review.isFeatured ? "var(--color-primary)" : "transparent",
                        color: review.isFeatured ? "white" : "inherit"
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                        {review.isFeatured ? "star" : "star_border"}
                      </span>
                      {review.isFeatured ? "Featured" : "Feature"}
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleDismiss(review.id)}
                      style={{
                        width: "128px",
                        padding: "10px",
                        fontSize: "11px",
                        borderRadius: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                        archive
                      </span>
                      Archive
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleApprove(review.id)}
                      style={{
                        width: "128px",
                        padding: "10px",
                        fontSize: "11px",
                        borderRadius: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                        check_circle
                      </span>
                      Approve
                    </button>
                    <button
                      className="btn"
                      onClick={() => handleDismiss(review.id)}
                      style={{
                        width: "128px",
                        padding: "10px",
                        fontSize: "11px",
                        borderRadius: 0,
                        backgroundColor: "var(--color-error)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                        delete
                      </span>
                        Dismiss
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "48px" }}>
            <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
              All reviews have been moderated. The queue is empty!
            </p>
          </div>
        )}
      </div>

      {/* Footer Pagination */}
      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1024px",
          margin: "48px auto 0",
          padding: "32px 0 64px 0",
          borderTop: "1px solid rgba(192, 200, 196, 0.2)",
        }}
      >
        <p className="copyright" style={{ margin: 0 }}>
          SHOWING {filteredReviews.length > 0 ? 1 : 0}-{filteredReviews.length} OF {reviews.length} REVIEWS
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="action-btn"
            style={{
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(192, 200, 196, 0.2)",
            }}
            disabled
          >
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
              chevron_left
            </span>
          </button>
          <button
            className="btn"
            style={{
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--color-primary)",
              color: "var(--color-on-primary)",
              fontWeight: "bold",
              fontSize: "12px",
              padding: 0,
            }}
          >
            1
          </button>
          <button
            className="action-btn"
            style={{
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(192, 200, 196, 0.2)",
            }}
            disabled
          >
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
              chevron_right
            </span>
          </button>
        </div>
      </footer>
    </>
  );
}
