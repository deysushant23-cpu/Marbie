"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar({
  isMobileActive,
  setIsMobileActive,
}: {
  isMobileActive: boolean;
  setIsMobileActive: (active: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <aside className={`admin-sidebar ${isMobileActive ? "active" : ""}`} id="sidebar">
        <div className="sidebar-header">
          <div>
            <h1 className="brand-title" style={{ fontSize: "24px" }}>Marbie Jewels</h1>
            <p className="brand-subtitle">Luxury Management</p>
          </div>
          <button
            className="btn-icon"
            onClick={() => setIsMobileActive(false)}
            style={{ display: isMobileActive ? "block" : "none" }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="nav-list">
          <Link
            className={`nav-link ${pathname === "/admin" ? "active" : ""}`}
            href="/admin"
            onClick={() => setIsMobileActive(false)}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link
            className={`nav-link ${pathname === "/admin/products" ? "active" : ""}`}
            href="/admin/products"
            onClick={() => setIsMobileActive(false)}
          >
            <span className="material-symbols-outlined">diamond</span>
            <span>Products</span>
          </Link>
          <Link
            className={`nav-link ${pathname === "/admin/collections" ? "active" : ""}`}
            href="/admin/collections"
            onClick={() => setIsMobileActive(false)}
          >
            <span className="material-symbols-outlined">category</span>
            <span>Categories</span>
          </Link>
          <Link
            className={`nav-link ${pathname === "/admin/lookbook" ? "active" : ""}`}
            href="/admin/lookbook"
            onClick={() => setIsMobileActive(false)}
          >
            <span className="material-symbols-outlined">menu_book</span>
            <span>Lookbook</span>
          </Link>
          <Link
            className={`nav-link ${pathname === "/admin/trousseau" ? "active" : ""}`}
            href="/admin/trousseau"
            onClick={() => setIsMobileActive(false)}
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            <span>Trousseau</span>
          </Link>
          <Link
            className={`nav-link ${pathname === "/admin/orders" ? "active" : ""}`}
            href="/admin/orders"
            onClick={() => setIsMobileActive(false)}
          >
            <span className="material-symbols-outlined">receipt_long</span>
            <span>Orders</span>
          </Link>
          <Link
            className={`nav-link ${pathname === "/admin/vouchers" ? "active" : ""}`}
            href="/admin/vouchers"
            onClick={() => setIsMobileActive(false)}
          >
            <span className="material-symbols-outlined">local_activity</span>
            <span>Vouchers</span>
          </Link>
          <Link
            className={`nav-link ${pathname === "/admin/customers" ? "active" : ""}`}
            href="/admin/customers"
            onClick={() => setIsMobileActive(false)}
          >
            <span className="material-symbols-outlined">group</span>
            <span>Customers</span>
          </Link>
          <Link
            className={`nav-link ${pathname === "/admin/newsletter" ? "active" : ""}`}
            href="/admin/newsletter"
            onClick={() => setIsMobileActive(false)}
          >
            <span className="material-symbols-outlined">mark_email_unread</span>
            <span>Newsletter</span>
          </Link>
          <Link
            className={`nav-link ${pathname === "/admin/reviews" ? "active" : ""}`}
            href="/admin/reviews"
            onClick={() => setIsMobileActive(false)}
          >
            <span className="material-symbols-outlined">rate_review</span>
            <span>Reviews</span>
          </Link>
          <Link
            className={`nav-link ${pathname === "/admin/carousel" ? "active" : ""}`}
            href="/admin/carousel"
            onClick={() => setIsMobileActive(false)}
          >
            <span className="material-symbols-outlined">view_carousel</span>
            <span>Carousel</span>
          </Link>
          <Link
            className={`nav-link ${pathname === "/admin/settings" ? "active" : ""}`}
            href="/admin/settings"
            onClick={() => setIsMobileActive(false)}
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
        </nav>
        <div className="sidebar-footer" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="user-profile">
            <div className="avatar">BK</div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p className="user-role">MANAGER</p>
              <p className="user-name" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Baisakhi Kanthariya</p>
            </div>
          </div>
          <button
            onClick={async () => {
              if (confirm("Log out of the Marbie Jewels Royal Management Suite?")) {
                try {
                  await fetch("/api/admin/login", { method: "DELETE" });
                  localStorage.removeItem("adminAuthenticated");
                  sessionStorage.clear();
                } catch {}
                window.location.href = "/";
              }
            }}
            style={{ 
              width: "100%", 
              background: "rgba(180, 30, 30, 0.08)", 
              color: "#ba1a1a", 
              border: "1px solid rgba(180, 30, 30, 0.25)", 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "8px", 
              padding: "10px", 
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "12px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "all 0.2s"
            }}
            className="hover:bg-red-500/10"
            type="button"
            title="Sign Out of Admin Panel"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
            <span>Log Out Suite</span>
          </button>
        </div>
      </aside>
      <div
        className={`admin-overlay ${isMobileActive ? "active" : ""}`}
        id="sidebar-overlay"
        onClick={() => setIsMobileActive(false)}
      ></div>
    </>
  );
}
