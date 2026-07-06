"use client";

import React, { useState, useEffect } from "react";

interface Voucher {
  id: number;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  maxUsers: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("10");
  const [minOrderAmount, setMinOrderAmount] = useState("0");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [maxUsers, setMaxUsers] = useState("100");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/vouchers");
      const data = await res.json();
      if (Array.isArray(data)) {
        setVouchers(data);
      }
    } catch (err) {
      console.error("Failed to fetch vouchers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingVoucher(null);
    setCode("");
    setDiscountType("PERCENTAGE");
    setDiscountValue("10");
    setMinOrderAmount("0");
    setMaxDiscount("");
    setMaxUsers("100");
    setExpiresAt("");
    setIsActive(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (v: Voucher) => {
    setEditingVoucher(v);
    setCode(v.code);
    setDiscountType(v.discountType);
    setDiscountValue(v.discountValue.toString());
    setMinOrderAmount(v.minOrderAmount.toString());
    setMaxDiscount(v.maxDiscount ? v.maxDiscount.toString() : "");
    setMaxUsers(v.maxUsers.toString());
    setExpiresAt(v.expiresAt || "");
    setIsActive(v.isActive);
    setShowModal(true);
  };

  const handleAutoGenerateCode = () => {
    const prefixes = ["ROYAL", "MARBIE", "LUXURY", "DIAMOND", "GOLD", "COUTURE", "FESTIVE", "SPECIAL"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(10 + Math.random() * 90);
    setCode(`${prefix}${suffix}`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !code.trim()) {
      alert("Please enter or generate a voucher code!");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: editingVoucher?.id,
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue) || 0,
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        maxUsers: Number(maxUsers) || 100,
        expiresAt: expiresAt || null,
        isActive,
      };

      const method = editingVoucher ? "PUT" : "POST";
      const res = await fetch("/api/admin/vouchers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save voucher");
      }

      setShowModal(false);
      fetchVouchers();
    } catch (err: any) {
      alert(err.message || "Error saving voucher.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (v: Voucher) => {
    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: v.id, isActive: !v.isActive }),
      });
      if (res.ok) {
        setVouchers((prev) =>
          prev.map((item) => (item.id === v.id ? { ...item, isActive: !v.isActive } : item))
        );
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDelete = async (id: number, codeName: string) => {
    if (!confirm(`Are you sure you want to delete voucher "${codeName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/vouchers?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setVouchers((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Failed to delete voucher.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleCopyCode = (codeName: string) => {
    navigator.clipboard.writeText(codeName);
    setCopySuccess(codeName);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const filteredVouchers = vouchers.filter((v) =>
    v.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalActive = vouchers.filter((v) => v.isActive).length;
  const totalClaims = vouchers.reduce((sum, v) => sum + v.usedCount, 0);
  const totalCapacity = vouchers.reduce((sum, v) => sum + v.maxUsers, 0);

  return (
    <>
      {/* Top Header */}
      <header className="page-header" style={{ borderBottom: "1px solid rgba(192, 200, 196, 0.1)", paddingBottom: "24px", marginBottom: "48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 className="page-title" style={{ fontSize: "28px", margin: "0 0 8px 0" }}>Voucher & Coupon Suite</h2>
          <p className="page-subtitle" style={{ margin: 0, color: "#8a9691" }}>Create discount codes, set usage limits for a certain amount of users, and manage promotions dynamically.</p>
        </div>
        <div className="header-actions" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div className="search-container" style={{ position: "relative" }}>
            <span className="material-symbols-outlined search-icon" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#8a9691" }}>search</span>
            <input
              className="search-input"
              placeholder="Search Voucher Code..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "10px 16px 10px 40px", borderRadius: "8px", border: "1px solid rgba(192, 200, 196, 0.2)", background: "#ffffff", fontSize: "14px", width: "240px", outline: "none" }}
            />
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="btn-primary"
            style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 700, background: "#063b2f", color: "#ffffff", border: "none", borderRadius: "8px", cursor: "pointer", boxShadow: "0 4px 12px rgba(6, 59, 47, 0.2)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add_circle</span>
            Create New Voucher
          </button>
        </div>
      </header>

      {/* Metrics Grid */}
      <section className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "48px" }}>
        <div className="stat-card" style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid rgba(192, 200, 196, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
          <div>
            <span className="stat-label" style={{ fontSize: "12px", fontWeight: 700, color: "#8a9691", letterSpacing: "0.08em" }}>ACTIVE CODES</span>
            <h3 className="stat-value" style={{ fontSize: "32px", fontWeight: 800, color: "#063b2f", margin: "8px 0 0 0" }}>{totalActive}</h3>
          </div>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(6, 59, 47, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#063b2f" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>local_activity</span>
          </div>
        </div>

        <div className="stat-card" style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid rgba(192, 200, 196, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
          <div>
            <span className="stat-label" style={{ fontSize: "12px", fontWeight: 700, color: "#8a9691", letterSpacing: "0.08em" }}>TOTAL REDEMPTIONS</span>
            <h3 className="stat-value" style={{ fontSize: "32px", fontWeight: 800, color: "#063b2f", margin: "8px 0 0 0" }}>{totalClaims.toLocaleString()}</h3>
          </div>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(212, 175, 55, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d4af37" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>verified</span>
          </div>
        </div>

        <div className="stat-card" style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid rgba(192, 200, 196, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
          <div>
            <span className="stat-label" style={{ fontSize: "12px", fontWeight: 700, color: "#8a9691", letterSpacing: "0.08em" }}>TOTAL CLAIM CAPACITY</span>
            <h3 className="stat-value" style={{ fontSize: "32px", fontWeight: 800, color: "#063b2f", margin: "8px 0 0 0" }}>{totalCapacity.toLocaleString()} Users</h3>
          </div>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(26, 86, 219, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a56db" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>groups</span>
          </div>
        </div>
      </section>

      {/* Vouchers Table */}
      <section style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid rgba(192, 200, 196, 0.2)", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(192, 200, 196, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "18px", color: "#063b2f" }}>Promotional Campaigns ({filteredVouchers.length})</h3>
        </div>

        {isLoading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#8a9691" }}>Loading Vouchers...</div>
        ) : filteredVouchers.length === 0 ? (
          <div style={{ padding: "64px 24px", textAlign: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "#c0c8c4", marginBottom: "16px" }}>confirmation_number</span>
            <p style={{ margin: "0 0 16px 0", color: "#8a9691", fontSize: "16px" }}>No discount vouchers found.</p>
            <button
              onClick={handleOpenCreateModal}
              style={{ padding: "10px 20px", background: "#063b2f", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}
            >
              + Create Your First Voucher
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8f9f8", borderBottom: "1px solid rgba(192, 200, 196, 0.2)", fontSize: "12px", fontWeight: 700, color: "#8a9691", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  <th style={{ padding: "16px 24px" }}>Voucher Code</th>
                  <th style={{ padding: "16px 24px" }}>Discount Terms</th>
                  <th style={{ padding: "16px 24px" }}>Min Cart Value</th>
                  <th style={{ padding: "16px 24px" }}>Usage Progress (Users)</th>
                  <th style={{ padding: "16px 24px" }}>Expiry Date</th>
                  <th style={{ padding: "16px 24px" }}>Status</th>
                  <th style={{ padding: "16px 24px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.map((v) => {
                  const percentUsed = Math.min(100, Math.round((v.usedCount / v.maxUsers) * 100));
                  const isSoldOut = v.usedCount >= v.maxUsers;
                  const isExpired = v.expiresAt && new Date(v.expiresAt) < new Date();

                  return (
                    <tr key={v.id} style={{ borderBottom: "1px solid rgba(192, 200, 196, 0.1)", transition: "background 0.2s" }} className="hover:bg-gray-50/50">
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ padding: "6px 12px", background: "#063b2f", color: "#ffffff", borderRadius: "6px", fontWeight: 800, fontSize: "14px", letterSpacing: "0.1em", fontFamily: "monospace", border: "1px dashed #d4af37" }}>
                            {v.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(v.code)}
                            title="Copy Code"
                            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#8a9691", padding: "4px", display: "flex", alignItems: "center" }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                              {copySuccess === v.code ? "check" : "content_copy"}
                            </span>
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: "16px 24px", fontWeight: 700, color: "#063b2f" }}>
                        {v.discountType === "PERCENTAGE" ? (
                          <>
                            <span style={{ fontSize: "16px", color: "#d4af37" }}>{v.discountValue}% OFF</span>
                            {v.maxDiscount && <span style={{ display: "block", fontSize: "12px", color: "#8a9691", fontWeight: 400 }}>Cap: ₹{v.maxDiscount.toLocaleString()}</span>}
                          </>
                        ) : (
                          <span style={{ fontSize: "16px", color: "#063b2f" }}>₹{v.discountValue.toLocaleString()} OFF</span>
                        )}
                      </td>

                      <td style={{ padding: "16px 24px", color: "#4a5550", fontWeight: 600 }}>
                        {v.minOrderAmount > 0 ? `₹${v.minOrderAmount.toLocaleString()}` : "No Minimum"}
                      </td>

                      <td style={{ padding: "16px 24px", minWidth: "180px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px", fontWeight: 600 }}>
                          <span style={{ color: isSoldOut ? "#ba1a1a" : "#063b2f" }}>
                            {v.usedCount} / {v.maxUsers} Users
                          </span>
                          <span style={{ color: "#8a9691" }}>{percentUsed}%</span>
                        </div>
                        <div style={{ width: "100%", height: "8px", background: "#f0f4f2", borderRadius: "4px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${percentUsed}%`,
                              height: "100%",
                              background: isSoldOut ? "#ba1a1a" : percentUsed > 80 ? "#e67e22" : "#063b2f",
                              borderRadius: "4px",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                        {isSoldOut && <span style={{ fontSize: "11px", color: "#ba1a1a", fontWeight: 700, display: "block", marginTop: "4px" }}>⚠️ LIMIT REACHED</span>}
                      </td>

                      <td style={{ padding: "16px 24px", fontSize: "13px", color: isExpired ? "#ba1a1a" : "#4a5550", fontWeight: isExpired ? 700 : 400 }}>
                        {v.expiresAt ? (
                          <>
                            {v.expiresAt}
                            {isExpired && <span style={{ display: "block", fontSize: "11px" }}>(EXPIRED)</span>}
                          </>
                        ) : (
                          "No Expiry"
                        )}
                      </td>

                      <td style={{ padding: "16px 24px" }}>
                        <button
                          onClick={() => handleToggleStatus(v)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 700,
                            border: "none",
                            cursor: "pointer",
                            background: v.isActive ? "rgba(6, 59, 47, 0.1)" : "rgba(186, 26, 26, 0.1)",
                            color: v.isActive ? "#063b2f" : "#ba1a1a",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: v.isActive ? "#063b2f" : "#ba1a1a" }} />
                          {v.isActive ? "Active" : "Disabled"}
                        </button>
                      </td>

                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            onClick={() => handleOpenEditModal(v)}
                            title="Edit Voucher"
                            style={{ padding: "8px", background: "#f0f4f2", color: "#063b2f", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(v.id, v.code)}
                            title="Delete Voucher"
                            style={{ padding: "8px", background: "rgba(186, 26, 26, 0.08)", color: "#ba1a1a", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "560px", padding: "32px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ margin: 0, fontSize: "22px", color: "#063b2f" }}>
                {editingVoucher ? `Edit Voucher (${editingVoucher.code})` : "Create Promotional Voucher"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#8a9691", padding: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>close</span>
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Code + Auto Generate */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#4a5550", marginBottom: "6px" }}>
                  VOUCHER CODE <span style={{ color: "#ba1a1a" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ROYAL20, SURAT500"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    style={{ flex: 1, padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(192, 200, 196, 0.4)", fontSize: "16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}
                  />
                  <button
                    type="button"
                    onClick={handleAutoGenerateCode}
                    style={{ padding: "12px 16px", background: "#f0f4f2", color: "#063b2f", border: "1px solid rgba(6, 59, 47, 0.2)", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>bolt</span>
                    Auto-Generate
                  </button>
                </div>
              </div>

              {/* Discount Type & Value */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#4a5550", marginBottom: "6px" }}>DISCOUNT TYPE</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(192, 200, 196, 0.4)", fontSize: "14px", background: "#ffffff" }}
                  >
                    <option value="PERCENTAGE">Percentage Off (%)</option>
                    <option value="FIXED">Fixed Amount Off (₹)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#4a5550", marginBottom: "6px" }}>
                    {discountType === "PERCENTAGE" ? "PERCENTAGE (%)" : "AMOUNT (₹)"}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={discountType === "PERCENTAGE" ? "100" : "100000"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(192, 200, 196, 0.4)", fontSize: "14px" }}
                  />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#4a5550", marginBottom: "6px" }}>MIN ORDER VALUE (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 for No Minimum"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(192, 200, 196, 0.4)", fontSize: "14px" }}
                  />
                </div>

                {discountType === "PERCENTAGE" && (
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#4a5550", marginBottom: "6px" }}>MAX DISCOUNT CAP (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Optional cap (e.g. 2000)"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value)}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(192, 200, 196, 0.4)", fontSize: "14px" }}
                    />
                  </div>
                )}
              </div>

              {/* Max Users & Expiry Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#063b2f", marginBottom: "6px" }}>
                    MAX USERS LIMIT <span style={{ fontSize: "11px", fontWeight: 400, color: "#8a9691" }}>(Certain amount of users)</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "2px solid #063b2f", fontSize: "14px", fontWeight: 700, color: "#063b2f" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#4a5550", marginBottom: "6px" }}>EXPIRY DATE (OPTIONAL)</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(192, 200, 196, 0.4)", fontSize: "14px" }}
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#f8f9f8", borderRadius: "8px" }}>
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#063b2f", cursor: "pointer" }}
                />
                <label htmlFor="isActiveToggle" style={{ fontSize: "14px", fontWeight: 600, color: "#063b2f", cursor: "pointer" }}>
                  Enable this voucher immediately after saving
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: "12px 24px", background: "transparent", color: "#8a9691", border: "1px solid rgba(192, 200, 196, 0.4)", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{ padding: "12px 28px", background: "#063b2f", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.7 : 1 }}
                >
                  {isSaving ? "Saving..." : editingVoucher ? "Update Voucher" : "Create Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
