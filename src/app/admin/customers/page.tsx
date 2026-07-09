"use client";

import React, { useState } from "react";
import Link from "next/link";

interface CustomerRecord {
  id: number | string;
  name: string;
  email?: string;
  phone?: string;
  joinDate: string;
  totalOrders: number;
  lifetimeSpend: number;
  tier: "VIP EMERALD" | "GOLD TIER" | "COLLECTOR" | string;
  image?: string;
}



export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");

  React.useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCustomers(data);
      })
      .catch((err) => console.error("Failed to fetch customers:", err));
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    // Check tier filter
    if (tierFilter !== "ALL" && customer.tier !== tierFilter) {
      return false;
    }

    // Check search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = (customer.name || "").toLowerCase().includes(query);
      const matchEmail = (customer.email || "").toLowerCase().includes(query);
      if (!matchName && !matchEmail) return false;
    }

    return true;
  });

  return (
    <>
      {/* Top Header */}
      <header className="page-header" style={{ borderBottom: "1px solid rgba(192, 200, 196, 0.1)", paddingBottom: "24px", marginBottom: "48px" }}>
        <div>
          <h2 className="page-title">Customer Directory</h2>
          <p className="page-subtitle">Managing {customers.length || 5} artisan clients.</p>
        </div>
        <div className="header-actions">
          <div className="search-container">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              className="search-input"
              placeholder="Search by name, email..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Quick Filters */}
      <section className="card" style={{ marginBottom: "32px", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="stat-label" style={{ margin: 0 }}>
              Tier Filters
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["ALL", "VIP EMERALD", "GOLD TIER", "COLLECTOR"].map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className="btn"
                style={{
                  backgroundColor: tierFilter === tier ? "var(--color-primary)" : "var(--color-surface-container-high)",
                  color: tierFilter === tier ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
                  fontSize: "10px",
                  borderRadius: "2px",
                  padding: "6px 16px",
                }}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Directory Grid Header */}
      <div
        className="hide-mobile"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "24px",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(192, 200, 196, 0.3)",
          color: "var(--color-on-surface-variant)",
          fontSize: "11px",
          fontWeight: "600",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: "16px",
        }}
      >
        <div style={{ gridColumn: "span 4" }}>Client Information</div>
        <div style={{ gridColumn: "span 2", textAlign: "center" }}>Join Date</div>
        <div style={{ gridColumn: "span 2", textAlign: "center" }}>Total Orders</div>
        <div style={{ gridColumn: "span 2", textAlign: "right" }}>Lifetime Spend</div>
        <div style={{ gridColumn: "span 2", textAlign: "right" }}>Tier</div>
      </div>

      {/* Customer List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="card"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                gap: "24px",
                alignItems: "center",
                padding: "20px 24px",
                border: "1px solid rgba(212, 175, 55, 0.15)",
                boxShadow: "0 20px 40px rgba(6, 59, 47, 0.08)",
                transition: "all 0.3s",
              }}
            >
              <div style={{ gridColumn: "span 4", display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "1px solid rgba(192, 200, 196, 0.3)",
                    flexShrink: 0,
                  }}
                >
                  <img
                    alt={customer.name}
                    src={customer.image}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 className="product-name" style={{ fontSize: "16px", margin: 0 }}>
                    {customer.name || "Artisan Client"}
                  </h4>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-on-surface-variant)",
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {customer.email || "No email"}
                  </p>
                  {customer.phone && (
                    <p style={{ fontSize: "11px", color: "var(--color-primary)", fontWeight: 600, margin: "2px 0 0 0" }}>
                      📞 {customer.phone}
                    </p>
                  )}
                </div>
              </div>
              <div
                style={{ gridColumn: "span 2", textAlign: "center", fontSize: "14px" }}
                className="hide-mobile"
              >
                {customer.joinDate}
              </div>
              <div style={{ gridColumn: "span 2", textAlign: "center" }} className="hide-mobile">
                <span
                  style={{
                    backgroundColor: "var(--color-surface-container)",
                    padding: "4px 12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "var(--color-primary)",
                  }}
                >
                  {customer.totalOrders.toString().padStart(2, "0")}
                </span>
              </div>
              <div
                style={{
                  gridColumn: "span 2",
                  textAlign: "right",
                  fontFamily: "var(--font-display)",
                  fontSize: "15px",
                  fontWeight: "500",
                  color: "var(--color-primary)",
                }}
                className="hide-mobile"
              >
                ₹{customer.lifetimeSpend.toLocaleString()}
              </div>
              <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px" }}>
                <span
                  className="copyright"
                  style={{
                    fontSize: "10px",
                    backgroundColor: customer.tier === "VIP EMERALD" ? "var(--color-primary)" : "transparent",
                    color: customer.tier === "VIP EMERALD" ? "var(--color-on-primary)" : "var(--color-secondary)",
                    border: customer.tier === "VIP EMERALD" ? "none" : "1px solid rgba(115, 92, 0, 0.4)",
                    padding: "4px 12px",
                    borderRadius: "2px",
                  }}
                >
                  {customer.tier}
                </span>
                <Link href={`/admin/customers/${customer.id}`} className="action-btn" style={{ textDecoration: "none", display: "flex", border: "none" }}>
                  <span className="material-symbols-outlined">chevron_right</span>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "48px" }}>
            <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
              No clients found matching the search query.
            </p>
          </div>
        )}
      </div>

      {/* Pagination footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "48px", paddingBottom: "64px" }}>
        <p className="copyright" style={{ margin: 0 }}>
          Showing 1-{filteredCustomers.length} of {filteredCustomers.length} clients
        </p>
        <div style={{ display: "flex", gap: "4px" }}>
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
              fontSize: "14px",
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
      </div>
    </>
  );
}
