"use client";

import React, { useState } from "react";
import Link from "next/link";

interface OrderItem {
  id: string;
  customerName: string;
  initials: string;
  avatarClass: string;
  date: string;
  amount: number;
  status: "SHIPPED" | "PROCESSING" | "DELIVERED";
}


export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  React.useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch((err) => console.error("Failed to fetch orders:", err));
  }, []);

  const filteredOrders = orders.filter((order) => {
    // Check status filter
    if (statusFilter !== "ALL" && order.status !== statusFilter) {
      return false;
    }

    // Check search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchId = (order.id || "").toString().toLowerCase().includes(query);
      const matchName = (order.customerName || "").toLowerCase().includes(query);
      if (!matchId && !matchName) return false;
    }

    return true;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const activeOrdersCount = orders.filter((o) => o.status === "PROCESSING" || o.status === "SHIPPED").length;
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  return (
    <>
      {/* Top Header */}
      <header className="page-header" style={{ borderBottom: "1px solid rgba(192, 200, 196, 0.1)", paddingBottom: "24px", marginBottom: "48px" }}>
        <div>
          <h2 className="page-title">Order History</h2>
          <p className="page-subtitle">Monitor and manage store purchases.</p>
        </div>
        <div className="header-actions" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link href="/admin/orders/labels">
            <button className="btn-primary" style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>print</span>
              Print Labels
            </button>
          </Link>
          <div className="search-container">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              className="search-input"
              placeholder="Search Order ID, Customer..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Metrics Grid */}
      <section className="stats-grid" style={{ marginBottom: "64px" }}>
        <div className="stat-card">
          <div>
            <span className="stat-label">TOTAL REVENUE</span>
            <h3 className="stat-value">₹{totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="stat-footer">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              trending_up
            </span>
            <span>+12% from last month</span>
          </div>
          <span className="material-symbols-outlined stat-bg-icon">payments</span>
        </div>
        <div className="stat-card">
          <div>
            <span className="stat-label">ACTIVE ORDERS</span>
            <h3 className="stat-value">{activeOrdersCount} Orders</h3>
          </div>
          <div className="stat-footer stat-trend-neutral">
            <span className="material-symbols-outlined">pending_actions</span>
            <span>4 requiring attention</span>
          </div>
          <span className="material-symbols-outlined stat-bg-icon">receipt_long</span>
        </div>
        <div className="stat-card">
          <div>
            <span className="stat-label">AVG. ORDER VALUE</span>
            <h3 className="stat-value">₹{avgOrderValue.toLocaleString()}</h3>
          </div>
          <div className="stat-footer stat-trend-neutral">
            <span className="material-symbols-outlined">workspace_premium</span>
            <span>Luxury Heritage tier</span>
          </div>
          <span className="material-symbols-outlined stat-bg-icon">loyalty</span>
        </div>
      </section>

      {/* Quick Filters */}
      <section className="card" style={{ marginBottom: "32px", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="stat-label" style={{ margin: 0 }}>
              Quick Filters
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["ALL", "PROCESSING", "SHIPPED", "DELIVERED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className="btn"
                style={{
                  backgroundColor: statusFilter === status ? "var(--color-primary)" : "var(--color-surface-container-high)",
                  color: statusFilter === status ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
                  fontSize: "10px",
                  borderRadius: "2px",
                  padding: "6px 16px",
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Orders Table */}
      <section className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="product-name">{order.id}</td>
                    <td>
                      <div className="product-cell">
                        <div className={`buyer-avatar ${order.avatarClass}`} style={{ width: "32px", height: "32px", fontSize: "10px" }}>
                          {order.initials}
                        </div>
                        <span className="product-name" style={{ fontSize: "14px" }}>
                          {order.customerName}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: "var(--color-on-surface-variant)" }}>{order.date}</td>
                    <td className="price-text">₹{order.amount.toLocaleString()}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          order.status === "SHIPPED"
                            ? "badge-lowstock"
                            : order.status === "PROCESSING"
                            ? "badge-instock"
                            : "badge-outofstock"
                        }`}
                        style={{
                          backgroundColor:
                            order.status === "SHIPPED"
                              ? "rgba(254, 214, 91, 0.2)"
                              : order.status === "PROCESSING"
                              ? "rgba(0, 36, 27, 0.1)"
                              : "var(--color-surface-variant)",
                          color:
                            order.status === "SHIPPED"
                              ? "var(--color-secondary)"
                              : order.status === "PROCESSING"
                              ? "var(--color-primary)"
                              : "var(--color-on-surface-variant)",
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {order.status === "PROCESSING" && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginRight: "16px" }}>
                          <select 
                            id={`courier-${order.id}`}
                            style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "4px", border: "1px solid #ccc", background: "#fff", color: "#000", height: "26px" }}
                          >
                            <option value="Delhivery">Delhivery</option>
                            <option value="BlueDart">Blue Dart</option>
                          </select>
                          <input 
                            type="number" 
                            id={`weight-${order.id}`} 
                            placeholder="kg" 
                            step="0.01"
                            defaultValue={0.5}
                            style={{ width: "50px", padding: "4px 4px", fontSize: "12px", borderRadius: "4px", border: "1px solid #ccc", background: "#fff", color: "#000", height: "26px" }} 
                            title="Package Weight in KG"
                          />
                          <button 
                            onClick={async (e) => {
                              const btn = e.currentTarget;
                              btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px">hourglass_empty</span>';
                              const courier = (document.getElementById(`courier-${order.id}`) as HTMLSelectElement).value;
                              const weightVal = parseFloat((document.getElementById(`weight-${order.id}`) as HTMLInputElement).value) || 0.5;
                              
                              try {
                                const res = await fetch(`/api/orders/${order.id.replace('#', '')}/dispatch`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ courierId: courier, weight: weightVal })
                                });
                                const data = await res.json();
                                if(data.success) {
                                  alert(`Dispatched via ${data.courier}! AWB: ${data.awb}`);
                                  window.location.reload();
                                } else {
                                  alert("Error dispatching: " + data.error);
                                  btn.innerHTML = 'DISPATCH';
                                }
                              } catch(err) {
                                alert("Failed to dispatch");
                                btn.innerHTML = 'DISPATCH';
                              }
                            }}
                            style={{ padding: "4px 12px", fontSize: "10px", fontWeight: "bold", background: "#063b2f", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", display: "inline-flex", alignItems: "center", height: "26px" }}
                          >
                            DISPATCH
                          </button>
                        </div>
                      )}
                      <div style={{ display: "inline-flex", justifyContent: "flex-end", gap: "8px" }}>
                        <Link href={`/admin/orders/labels?id=${encodeURIComponent(order.id)}`} className="action-btn" title="Print Label" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>local_shipping</span>
                        </Link>
                        <Link href={`/admin/orders/${order.id.replace('#', '')}`} className="action-btn" title="View Details" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          <span className="material-symbols-outlined">more_vert</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "48px 0", color: "var(--color-on-surface-variant)" }}>
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", backgroundColor: "var(--color-surface-container-low)" }}>
          <p className="copyright" style={{ margin: 0 }}>
            Showing 1-{filteredOrders.length} of {filteredOrders.length} results
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button className="action-btn" disabled style={{ opacity: 0.3 }}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="copyright" style={{ fontWeight: "700" }}>
              Page 1 of 1
            </span>
            <button className="action-btn" disabled style={{ opacity: 0.3 }}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Product Preview */}
      <section className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "48px", marginTop: "64px", paddingTop: "48px", borderTop: "1px solid rgba(192, 200, 196, 0.1)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h4 className="card-title" style={{ marginBottom: "16px" }}>
              Operational Analytics
            </h4>
            <p style={{ color: "var(--color-on-surface-variant)", fontSize: "15px", lineHeight: "1.8" }}>
              Order fulfillment has increased by 14% this quarter through improved logistical partnerships in the domestic region.
              Monitor real-time shipping status updates to maintain our signature concierge service standard.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ padding: "24px", border: "1px solid rgba(212, 175, 55, 0.2)", backgroundColor: "var(--color-surface-container-low)" }}>
              <span style={{ display: "block", fontSize: "24px", fontFamily: "var(--font-display)", color: "var(--color-primary)", fontWeight: "600", marginBottom: "8px" }}>
                98.2%
              </span>
              <span className="copyright" style={{ color: "var(--color-on-surface-variant)" }}>
                Fulfilled On-Time
              </span>
            </div>
            <div style={{ padding: "24px", border: "1px solid rgba(212, 175, 55, 0.2)", backgroundColor: "var(--color-surface-container-low)" }}>
              <span style={{ display: "block", fontSize: "24px", fontFamily: "var(--font-display)", color: "var(--color-primary)", fontWeight: "600", marginBottom: "8px" }}>
                2.4h
              </span>
              <span className="copyright" style={{ color: "var(--color-on-surface-variant)" }}>
                Avg. Response Time
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
