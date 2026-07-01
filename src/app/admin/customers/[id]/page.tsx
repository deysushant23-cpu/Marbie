import React from "react";
import Link from "next/link";

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <header className="page-header" style={{ marginBottom: "32px", display: "flex", gap: "24px", alignItems: "center" }}>
        <Link href="/admin/customers" style={{ textDecoration: "none", color: "var(--color-on-surface-variant)", display: "flex" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>arrow_back</span>
        </Link>
        <div>
          <h2 className="page-title" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            Customer Profile
            <span style={{ 
              fontSize: "12px", padding: "4px 12px", backgroundColor: "var(--color-primary)", 
              color: "var(--color-on-primary)", borderRadius: "2px", fontWeight: "600", letterSpacing: "0.1em"
            }}>
              VIP EMERALD
            </span>
          </h2>
          <p className="page-subtitle">Client ID: #{id.padStart(4, '0')}</p>
        </div>
      </header>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 2fr" }}>
        {/* Customer Info Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <section className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div className="buyer-avatar avatar-vk" style={{ width: "96px", height: "96px", fontSize: "32px", margin: "0 auto 24px auto" }}>
              ER
            </div>
            <h3 style={{ fontSize: "24px", color: "var(--color-primary)", marginBottom: "8px" }}>Eleanor Rigby</h3>
            <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "32px" }}>eleanor.rigby@example.com</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
              <div>
                <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Phone</p>
                <p style={{ fontSize: "14px", color: "var(--color-on-surface)" }}>+44 7700 900077</p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Location</p>
                <p style={{ fontSize: "14px", color: "var(--color-on-surface)" }}>London, UK</p>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Client Since</p>
                <p style={{ fontSize: "14px", color: "var(--color-on-surface)" }}>October 2024</p>
              </div>
            </div>
          </section>
        </div>

        {/* Purchase History */}
        <section className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <h4 className="card-title" style={{ marginBottom: 0 }}>Order History</h4>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Lifetime Spend</p>
              <p style={{ fontSize: "24px", fontWeight: 600, color: "var(--color-primary)" }}>₹1,42,500</p>
            </div>
          </div>
          
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: "right" }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><Link href="/admin/orders/ORD-9021" style={{ color: "var(--color-primary)", fontWeight: 500, textDecoration: "none" }}>#ORD-9021</Link></td>
                  <td>Oct 24, 2024</td>
                  <td>
                    <span className="status-badge badge-instock" style={{ backgroundColor: "rgba(0, 36, 27, 0.1)", color: "var(--color-primary)" }}>PROCESSING</span>
                  </td>
                  <td style={{ textAlign: "right" }}>₹34,500</td>
                </tr>
                <tr>
                  <td><Link href="/admin/orders/ORD-8812" style={{ color: "var(--color-primary)", fontWeight: 500, textDecoration: "none" }}>#ORD-8812</Link></td>
                  <td>Sep 12, 2024</td>
                  <td>
                    <span className="status-badge badge-lowstock" style={{ backgroundColor: "rgba(254, 214, 91, 0.2)", color: "var(--color-secondary)" }}>SHIPPED</span>
                  </td>
                  <td style={{ textAlign: "right" }}>₹108,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
