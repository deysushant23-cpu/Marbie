"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileActive, setIsMobileActive] = useState(false);

  return (
    <div className="app-container">
      {/* Mobile Top Bar */}
      <div className="mobile-header">
        <h1 className="mobile-logo">Marbie Jewels</h1>
        <button className="btn-icon" onClick={() => setIsMobileActive(true)}>
          <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
            menu
          </span>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <AdminSidebar
        isMobileActive={isMobileActive}
        setIsMobileActive={setIsMobileActive}
      />

      {/* Main Content Area */}
      <main className="main-content">{children}</main>
    </div>
  );
}
