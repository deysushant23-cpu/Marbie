"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProductItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: "IN STOCK" | "LOW STOCK" | "OUT OF STOCK";
  image: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    // Fetch products
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted: ProductItem[] = data.map((p: any) => {
            const rawCat = p.category || "Jewelry";
            const catStr = typeof rawCat === "string" && rawCat.length > 0 ? rawCat.charAt(0).toUpperCase() + rawCat.slice(1) : "Jewelry";
            return {
              id: p.id,
              name: p.name || "Untitled",
              category: catStr,
              stock: p.stock || 0,
              price: p.price || 0,
              status: (p.stock === 0 ? "OUT OF STOCK" : p.stock < 5 ? "LOW STOCK" : "IN STOCK") as "IN STOCK" | "LOW STOCK" | "OUT OF STOCK",
              image: p.image || "",
            };
          });
          setProducts(formatted);
        }
      })
      .catch((err) => console.error(err));

    // Fetch orders
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch((err) => console.error(err));

    // Fetch customers
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCustomers(data);
      })
      .catch((err) => console.error(err));

    // Fetch config
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.isMaintenanceMode !== undefined) {
          setIsMaintenanceMode(data.isMaintenanceMode);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const toggleMaintenanceMode = async () => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isMaintenanceMode: !isMaintenanceMode })
      });
      if (res.ok) {
        setIsMaintenanceMode(!isMaintenanceMode);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin"; // Forces full reload so Server Layout sees the missing cookie
  };

  const filteredProducts = products.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSales = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const totalPieces = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  const buyers = customers.map((c: any) => {
    const rawName = c.name || "Customer";
    const initials = rawName
      .split(" ")
      .map((n: string) => n[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const colors = ["avatar-vk", "avatar-sm", "avatar-rd"];
    const avatarClass = colors[c.id % colors.length];
    return {
      id: c.id,
      name: c.name,
      initials,
      class: avatarClass,
      orders: c.totalOrders,
      totalSpent: c.lifetimeSpend,
      tier: c.tier,
    };
  });

  return (
    <>
      {/* Page Header */}
      <header className="page-header">
        <div>
          <h2 className="page-title">Overview</h2>
          <p className="page-subtitle">Monitoring performance and inventory.</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-outline" 
            onClick={toggleMaintenanceMode}
            disabled={isUpdatingStatus}
            style={{ 
              borderColor: isMaintenanceMode ? "var(--color-error)" : "var(--color-outline)", 
              color: isMaintenanceMode ? "var(--color-error)" : "inherit",
              display: "flex", alignItems: "center", gap: "8px" 
            }}
          >
            <span className="material-symbols-outlined">{isMaintenanceMode ? "toggle_on" : "toggle_off"}</span>
            {isMaintenanceMode ? "MAINTENANCE MODE ON" : "MAINTENANCE MODE OFF"}
          </button>
          <Link href="/admin/products?id=new" className="btn btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            ADD NEW PRODUCT
          </Link>
          <button className="btn btn-outline" onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "8px", borderColor: "transparent" }}>
            <span className="material-symbols-outlined">logout</span>
            LOGOUT
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <div>
            <span className="stat-label">TOTAL SALES</span>
            <h3 className="stat-value">₹{totalSales.toLocaleString()}</h3>
          </div>
          <div className="stat-footer">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              trending_up
            </span>
            <span>Based on {orders.length} orders</span>
          </div>
          <span className="material-symbols-outlined stat-bg-icon">payments</span>
        </div>
        <div className="stat-card">
          <div>
            <span className="stat-label">TOTAL PRODUCTS</span>
            <h3 className="stat-value">{totalPieces} Pieces</h3>
          </div>
          <div className="stat-footer stat-trend-neutral">
            <span className="material-symbols-outlined">inventory_2</span>
            <span>Across {products.length} models</span>
          </div>
          <span className="material-symbols-outlined stat-bg-icon">diamond</span>
        </div>
        <div className="stat-card">
          <div>
            <span className="stat-label">NEW CUSTOMERS</span>
            <h3 className="stat-value">{customers.length} Registered</h3>
          </div>
          <div className="stat-footer">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              person_add
            </span>
            <span>Total user base</span>
          </div>
          <span className="material-symbols-outlined stat-bg-icon">group</span>
        </div>
      </section>

      {/* Bento Layout Grid */}
      <div className="dashboard-grid">
        {/* Inventory Section */}
        <section className="card inventory-section">
          <div className="card-header-flex">
            <h4 className="card-title" style={{ marginBottom: 0 }}>
              Inventory
            </h4>
            <div className="search-container">
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                className="search-input"
                placeholder="Search..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>STOCK</th>
                  <th>PRICE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-img">
                          <img alt={product.name} src={product.image} />
                        </div>
                        <div>
                          <p className="product-name">{product.name}</p>
                          <p className="product-cat">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td>{product.stock}</td>
                    <td>
                      <span className="price-text">₹{product.price.toLocaleString()}</span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          product.status === "IN STOCK"
                            ? "badge-instock"
                            : product.status === "LOW STOCK"
                            ? "badge-lowstock"
                            : "badge-outofstock"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/admin/products?id=${product.id}`} className="action-btn">
                        <span className="material-symbols-outlined">edit_note</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/admin/products" className="view-all-btn" style={{ textDecoration: "none" }}>
            <span>MANAGE ALL PRODUCTS</span>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              arrow_forward
            </span>
          </Link>
        </section>

        {/* Recent Buyers Section */}
        <section className="card">
          <h4 className="card-title">Recent Buyers</h4>
          <div className="buyers-list">
            {buyers.map((buyer) => (
              <div key={buyer.id} className="buyer-item">
                <div className={`buyer-avatar ${buyer.class}`}>{buyer.initials}</div>
                <div className="buyer-info">
                  <p className="buyer-name">{buyer.name}</p>
                  <p className="buyer-meta">{buyer.orders} orders placed</p>
                </div>
                <div className="buyer-value">
                  <p className="value-amount">₹{buyer.totalSpent.toLocaleString()}</p>
                  <p className="value-tier">{buyer.tier}</p>
                </div>
              </div>
            ))}
            {buyers.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-on-surface-variant)" }}>
                No recent buyers found.
              </div>
            )}
          </div>

          {/* Heatmap Activity widget */}
          <div className="activity-widget">
            <span className="widget-label">WEEKLY ACTIVITY</span>
            <div className="bar-chart">
              <div className="bar" style={{ height: "45%" }}></div>
              <div className="bar" style={{ height: "65%" }}></div>
              <div className="bar" style={{ height: "35%" }}></div>
              <div className="bar" style={{ height: "85%" }}></div>
              <div className="bar" style={{ height: "55%" }}></div>
              <div className="bar" style={{ height: "95%" }}></div>
              <div className="bar" style={{ height: "70%" }}></div>
            </div>
            <div className="bar-labels">
              <span>MON</span>
              <span>SUN</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
