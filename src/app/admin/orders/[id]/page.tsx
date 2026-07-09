"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [status, setStatus] = useState("PROCESSING");
  const [trackingLink, setTrackingLink] = useState("");
  const [trackingPartner, setTrackingPartner] = useState("");
  const [refundRequested, setRefundRequested] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setStatus(data.status || "PROCESSING");
        setTrackingLink(data.trackingLink || "");
        setTrackingPartner(data.trackingPartner || "");
        setRefundRequested(data.refundRequested || false);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleUpdate = async (newStatus: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id,
          status: newStatus,
          trackingLink,
          trackingPartner,
          refundRequested
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
        setStatus(updated.status);
        alert("Order updated successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update order");
    }
  };

  const handleShiprocketAction = async (action: string) => {
    try {
      if (action === "DOWNLOAD_LABEL") {
        const res = await fetch("/api/admin/shipping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id, action })
        });
        const data = await res.json();
        if (data.labelUrl) {
          window.open(data.labelUrl, "_blank");
        } else {
          alert(data.error || "Failed to download label.");
        }
        return;
      }

      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, action })
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        setStatus(data.order.status);
        setTrackingLink(data.order.trackingLink || "");
        setTrackingPartner(data.order.trackingPartner || "");
        alert(`Successfully executed: ${action.replace(/_/g, " ")}`);
      } else {
        const error = await res.json();
        alert(error.error || "Action failed");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred connecting to Shiprocket.");
    }
  };

  if (loading) {
    return <div style={{ padding: "48px" }}>Loading order details...</div>;
  }

  if (!order) {
    return <div style={{ padding: "48px" }}>Order not found.</div>;
  }

  return (
    <>
      <header className="page-header" style={{ marginBottom: "32px", display: "flex", gap: "24px", alignItems: "center" }}>
        <Link href="/admin/orders" style={{ textDecoration: "none", color: "var(--color-on-surface-variant)", display: "flex" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>arrow_back</span>
        </Link>
        <div>
          <h2 className="page-title" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            Order {order.id}
            <span style={{ 
              fontSize: "12px", padding: "4px 12px", backgroundColor: "rgba(0, 36, 27, 0.1)", 
              color: "var(--color-primary)", borderRadius: "2px", fontWeight: "600", letterSpacing: "0.1em"
            }}>
              {order.status}
            </span>
          </h2>
          <p className="page-subtitle">Placed on {order.date}</p>
        </div>
      </header>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "2fr 1fr" }}>
        {/* Order Info & Management */}
        <section className="card">
          <h4 className="card-title" style={{ marginBottom: "24px" }}>Manage Fulfillment</h4>
          
          {status === "PROCESSING" ? (
            <div style={{ padding: "24px", backgroundColor: "var(--color-surface-container)", borderRadius: "4px", border: "1px solid var(--color-outline-variant)" }}>
              <p style={{ marginBottom: "16px", color: "var(--color-on-surface)" }}>This is a new order. Verify the items and accept the order to send packing details to Shiprocket.</p>
              <button className="btn-primary" onClick={() => handleShiprocketAction("ACCEPT_AND_PACK")} style={{ padding: "12px 32px", width: "100%" }}>
                ACCEPT & PACK ORDER
              </button>
            </div>
          ) : status === "PACKED" ? (
            <div style={{ padding: "24px", backgroundColor: "var(--color-surface-container)", borderRadius: "4px", border: "1px solid var(--color-outline-variant)" }}>
              <p style={{ marginBottom: "16px", color: "var(--color-on-surface)" }}>Order packed! Shiprocket Order ID: {order.shiprocketOrderId}</p>
              <button className="btn-primary" onClick={() => handleShiprocketAction("GENERATE_AWB")} style={{ padding: "12px 32px", width: "100%" }}>
                GENERATE AWB / TRACKING
              </button>
            </div>
          ) : status === "READY_TO_DISPATCH" ? (
            <div style={{ padding: "24px", backgroundColor: "var(--color-surface-container)", borderRadius: "4px", border: "1px solid var(--color-outline-variant)" }}>
              <p style={{ marginBottom: "8px" }}><strong style={{ color: "var(--color-primary)" }}>AWB Assigned:</strong> {order.awbCode}</p>
              <p style={{ marginBottom: "16px" }}><strong style={{ color: "var(--color-primary)" }}>Courier:</strong> {trackingPartner}</p>
              <div style={{ display: "flex", gap: "16px" }}>
                <button className="btn-outline" onClick={() => handleShiprocketAction("DOWNLOAD_LABEL")} style={{ flex: 1, padding: "12px" }}>
                  PRINT LABEL
                </button>
                <button className="btn-primary" onClick={() => handleShiprocketAction("DISPATCH")} style={{ flex: 1, padding: "12px" }}>
                  SCHEDULE PICKUP & DISPATCH
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: "24px", backgroundColor: "var(--color-surface-container)", borderRadius: "4px", border: "1px solid var(--color-outline-variant)" }}>
              <p style={{ margin: "0 0 12px 0", fontSize: "14px" }}><strong style={{ color: "var(--color-primary)" }}>Status:</strong> {status}</p>
              {trackingPartner && <p style={{ margin: "0 0 12px 0", fontSize: "14px" }}><strong style={{ color: "var(--color-primary)" }}>Delivery Partner:</strong> {trackingPartner}</p>}
              {trackingLink && <p style={{ margin: "0 0 12px 0", fontSize: "14px" }}><strong style={{ color: "var(--color-primary)" }}>Tracking Link:</strong> <a href={trackingLink} target="_blank" style={{ color: "var(--color-secondary)", textDecoration: "underline" }}>{trackingLink}</a></p>}
              
              <div className="form-group" style={{ marginTop: "24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
                <input 
                  type="checkbox" 
                  id="refundRequested"
                  checked={refundRequested}
                  onChange={(e) => setRefundRequested(e.target.checked)}
                  style={{ width: "20px", height: "20px", accentColor: "var(--color-primary)" }}
                />
                <label htmlFor="refundRequested" className="form-label" style={{ margin: 0 }}>
                  Customer Requested Refund / Exchange
                </label>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "24px" }}>
                {status === "SHIPPED" && (
                  <button className="btn-primary" onClick={() => handleUpdate("DELIVERED")} style={{ padding: "12px 24px" }}>
                    MARK DELIVERED
                  </button>
                )}
                {refundRequested && status !== "REFUNDED" && (
                  <button className="btn-outline" onClick={() => handleUpdate("REFUNDED")} style={{ padding: "12px 24px", color: "red", borderColor: "red" }}>
                    PROCESS REFUND
                  </button>
                )}
                <button className="btn-outline" onClick={() => handleUpdate(status)} style={{ padding: "12px 24px" }}>
                  SAVE CHANGES
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Customer Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <section className="card">
            <h4 className="card-title" style={{ marginBottom: "24px" }}>Customer Contact & Shipping</h4>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div className={`buyer-avatar ${order.avatarClass || 'avatar-vk'}`} style={{ width: "48px", height: "48px", fontSize: "16px" }}>
                {order.initials}
              </div>
              <div>
                <p style={{ fontWeight: 600, color: "var(--color-primary)", marginBottom: "4px" }}>{order.customerName}</p>
                <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)" }}>Total Paid: ₹{order.amount?.toLocaleString()}</p>
              </div>
            </div>

            <div style={{ padding: "16px", backgroundColor: "var(--color-surface-container)", borderRadius: "6px", border: "1px solid var(--color-outline-variant)", marginBottom: "24px", fontSize: "13px" }}>
              <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--color-primary)" }}>phone_iphone</span>
                <span><strong>Phone:</strong> {order.shippingAddress?.phone || order.phone || "Not provided"}</span>
              </div>
              <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--color-primary)" }}>mail</span>
                <span><strong>Email:</strong> {order.shippingAddress?.email || order.email || "Not provided"}</span>
              </div>
              {order.shippingAddress?.address && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed var(--color-outline-variant)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--color-primary)" }}>location_on</span>
                  <span><strong>Address:</strong> {order.shippingAddress.address}</span>
                </div>
              )}
            </div>
            
            <h5 style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Status Insights</h5>
            {refundRequested && (
              <p style={{ fontSize: "14px", color: "red", fontWeight: "bold", marginBottom: "8px" }}>
                User raised a refund/exchange request.
              </p>
            )}
            <p style={{ fontSize: "14px", color: "var(--color-on-surface)", marginBottom: "24px" }}>
              {status === "PROCESSING" ? "Order is currently being prepared." : `Order has been marked as ${status}.`}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
