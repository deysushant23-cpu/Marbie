"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const urlOrderId = searchParams.get("orderId");
  
  const [orderId, setOrderId] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (urlOrderId) {
      setOrderId(urlOrderId);
      setContactInfo("user@example.com"); // Auto-fill
      
      fetch(`/api/orders/${encodeURIComponent(urlOrderId)}`)
        .then(res => res.json())
        .then(data => {
          if(!data.error) {
            setOrderDetails(data);
          } else {
             // Fallback to localstorage
             const history = JSON.parse(localStorage.getItem("orderHistory") || "[]");
             const foundOrder = history.find((o: any) => o.id === urlOrderId);
             if (foundOrder) setOrderDetails(foundOrder);
          }
        })
        .catch(err => {
             const history = JSON.parse(localStorage.getItem("orderHistory") || "[]");
             const foundOrder = history.find((o: any) => o.id === urlOrderId);
             if (foundOrder) setOrderDetails(foundOrder);
        });
      
      setShowResults(true);
      setTimeout(() => {
        const resultsEl = document.getElementById("resultsContainer");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  }, [urlOrderId]);

  const handleDownloadInvoice = async (order: any) => {
    const orderTotal = order.total !== undefined ? order.total : order.amount || 0;
    const shippingFee = order.shippingAddress?.shippingFee !== undefined ? order.shippingAddress.shippingFee : (order.shippingFee !== undefined ? order.shippingFee : 80);
    const courierName = order.shippingAddress?.courier || "Ekart Logistics Elite";
    const subtotal = Math.max(0, orderTotal - shippingFee);
    const rawPm = order.paymentMethod || "Secured Digital Payment";
    const isCOD = rawPm.toUpperCase().includes("COD") || rawPm.toLowerCase() === "cod";
    const isDelivered = (order.status || "").toUpperCase() === "DELIVERED";
    const paymentStatusDisplay = isCOD 
      ? (isDelivered ? "PAID (Collected on Delivery)" : "PENDING (Cash on Delivery)") 
      : "PAID ONLINE (Verified Gateway)";
    const paymentInfoDisplay = isCOD 
      ? "Cash on Delivery (COD)<br>Payable upon receipt of package" 
      : `${rawPm === "Razorpay" ? "Razorpay Gateway" : rawPm}<br>Marbie Secure Checkout • Verified`;
    const htmlContent = `
<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #1e293b; padding: 48px; margin: 0 auto; max-width: 800px; background-color: #ffffff; box-sizing: border-box;">
  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
    <div>
      <div style="font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;">MARBIE JEWELS</div>
      <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Luxury Bridal & Contemporary Jewelry</div>
      <div style="font-size: 12px; color: #334155; margin-top: 6px;">
        <strong>Owner/Management:</strong> Baisakhi Kanthariya<br>
        <strong>Official Email:</strong> marbiejewels4@gmail.com
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 32px; font-weight: 300; color: #94a3b8; letter-spacing: 0.1em;">INVOICE</div>
      <div style="font-size: 14px; font-weight: 600; color: #334155; margin-top: 4px;">#${order.id || orderId}</div>
    </div>
  </div>

  <div style="height: 1px; background-color: #e2e8f0; margin: 32px 0;"></div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
    <div>
      <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Billed To</div>
      <div style="font-size: 15px; font-weight: 600; color: #0f172a;">${order.shippingAddress?.fullName || order.customerName || 'Valued Customer'}</div>
      <div style="font-size: 13px; color: #64748b; margin-top: 4px; line-height: 1.5;">
        ${order.shippingAddress?.address || 'Direct Storefront Purchase'}<br>
        ${order.shippingAddress?.city ? `${order.shippingAddress.city}, ${order.shippingAddress.state || ''} ${order.shippingAddress.zipCode || ''}` : 'Customer Account'}
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Invoice Details</div>
      <div style="font-size: 13px; color: #64748b;"><strong style="color: #1e293b;">Date Issued:</strong> ${order.date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</div>
      <div style="font-size: 13px; color: #64748b; margin-top: 4px;"><strong style="color: #1e293b;">Payment Status:</strong> ${paymentStatusDisplay}</div>
      <div style="font-size: 13px; color: #2874f0; margin-top: 4px;"><strong style="color: #1e293b;">Delivery Partner:</strong> Ekart Logistics</div>
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
    <thead>
      <tr style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
        <th style="text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; width: 45%;">Product Details</th>
        <th style="text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; width: 20%;">SKU</th>
        <th style="text-align: center; padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; width: 10%;">Qty</th>
        <th style="text-align: right; padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; width: 12%;">Price</th>
        <th style="text-align: right; padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; width: 13%;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${(order.items || []).map((item: any) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 16px; font-size: 14px; font-weight: 600; color: #0f172a;">
            ${item.name}
            ${item.category ? `<div style="font-size: 11px; font-weight: 400; color: #64748b; margin-top: 2px;">Category: ${item.category}</div>` : ''}
          </td>
          <td style="padding: 16px; font-size: 12px; font-family: monospace; color: #475569;">${item.sku || item.id || 'MB-' + Math.floor(1000 + Math.random()*9000)}</td>
          <td style="padding: 16px; font-size: 14px; text-align: center; color: #334155;">${item.quantity}</td>
          <td style="padding: 16px; font-size: 14px; text-align: right; color: #334155;">₹${item.price.toLocaleString()}</td>
          <td style="padding: 16px; font-size: 14px; text-align: right; font-weight: 600; color: #0f172a;">₹${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 24px;">
    <div style="width: 50%;">
      <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Payment Info</div>
      <div style="font-size: 13px; color: #64748b; line-height: 1.5;">${paymentInfoDisplay}</div>
    </div>
    <div style="width: 40%;">
      <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #64748b;">
        <span>Subtotal</span>
        <span>₹${subtotal.toLocaleString()}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #64748b;">
        <span>Courier / Shipping (${courierName})</span>
        <span style="text-align: right; color: #0f172a; font-weight: 600;">₹${shippingFee.toLocaleString()}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; border-top: 1px solid #e2e8f0; margin-top: 8px;">
        <span>Total Due</span>
        <span>₹${orderTotal.toLocaleString()}</span>
      </div>
    </div>
  </div>

  <div style="text-align: center; margin-top: 48px; padding-top: 24px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b; line-height: 1.6;">
    <strong style="color: #0f172a;">Marbie Jewels • Official Commercial Invoice</strong><br>
    For order assistance, support, or verification, contact Owner/Management directly:<br>
    <strong>Baisakhi Kanthariya</strong> | Email: <strong>marbiejewels4@gmail.com</strong> | Web: <strong>www.marbie.com</strong>
  </div>
</div>`;

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    container.style.width = "800px";
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${order.id || orderId}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF invoice:", err);
      alert("Failed to generate PDF invoice. Please try again.");
    } finally {
      document.body.removeChild(container);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId && contactInfo) {
      fetch(`/api/orders/${encodeURIComponent(orderId)}`)
        .then(res => res.json())
        .then(data => {
          if(!data.error) {
            setOrderDetails(data);
          } else {
             const history = JSON.parse(localStorage.getItem("orderHistory") || "[]");
             const foundOrder = history.find((o: any) => o.id === orderId);
             if (foundOrder) setOrderDetails(foundOrder);
          }
        })
        .catch(err => {
             const history = JSON.parse(localStorage.getItem("orderHistory") || "[]");
             const foundOrder = history.find((o: any) => o.id === orderId);
             if (foundOrder) setOrderDetails(foundOrder);
        });
      
      setShowResults(true);
      // Smooth scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById("resultsContainer");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  return (
    <main className="container" style={{ minHeight: "716px", padding: "64px var(--margin-mobile)" }}>
      {/* Header Section */}
      <div className="page-header" style={{ marginBottom: "64px" }}>
        <h1 className="page-title" style={{ textTransform: "uppercase", letterSpacing: "0.15em" }}>
          Track Your Journey
        </h1>
        <p className="page-description">
          Enter your details below to follow your Marbie Jewels masterpiece from our workshop to your doorstep.
        </p>
      </div>

      {/* Tracking Search Card */}
      <div className="tracking-search-card">
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="tracking-form-group">
            <input
              className="tracking-form-input"
              id="orderId"
              placeholder=" "
              required
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <label className="tracking-form-label" htmlFor="orderId">
              Order ID
            </label>
          </div>
          <div className="tracking-form-group">
            <input
              className="tracking-form-input"
              id="contactInfo"
              placeholder=" "
              required
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
            />
            <label className="tracking-form-label" htmlFor="contactInfo">
              Email or Phone Number
            </label>
          </div>
          <button
            className="btn-primary hover-scale"
            type="submit"
            style={{ width: "100%", padding: "16px 32px", fontSize: "12px", letterSpacing: "0.15em" }}
          >
            Track My Order
          </button>
        </form>
      </div>

      {/* Tracking Results (Hidden by default, shown via state) */}
      <AnimatePresence>
        {showResults && (
          <motion.div 
            id="resultsContainer" 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="results-container">
            {/* Progress Stepper */}
            <div className="shipping-status-card">
              <h3 className="modal-title" style={{ marginBottom: "40px" }}>
                Shipping Status
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
                {/* Dynamic Stepper */}
                {(() => {
                  const status = orderDetails?.status || "PROCESSING";
                  const isShipped = status === "SHIPPED" || status === "DELIVERED";
                  const isDelivered = status === "DELIVERED";
                  const isRefunded = status === "REFUNDED";

                  return (
                    <>
                      {/* Step 1: Confirmed */}
                      <div className={isShipped || isDelivered ? "stepper-line" : ""} style={{ display: "flex", gap: "24px" }}>
                        <div style={{ zIndex: 10, backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "14px", fontWeight: "bold" }}>check</span>
                        </div>
                        <div>
                          <h4 className="form-label" style={{ marginBottom: "4px" }}>Order Confirmed</h4>
                          <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", fontStyle: "italic", marginBottom: "4px" }}>{orderDetails ? orderDetails.date : "Recent"}</p>
                        </div>
                      </div>

                      {/* Step 2: Processing */}
                      <div className={isShipped || isDelivered ? "stepper-line" : ""} style={{ display: "flex", gap: "24px" }}>
                        <div style={{ zIndex: 10, backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "14px", fontWeight: "bold" }}>check</span>
                        </div>
                        <div>
                          <h4 className="form-label" style={{ marginBottom: "4px" }}>Processing</h4>
                          <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)" }}>Your pieces are being prepared by our jewelers.</p>
                        </div>
                      </div>

                      {/* Step 3: Shipped / In Transit */}
                      {!isRefunded && (
                        <div className={isDelivered ? "stepper-line" : ""} style={{ display: "flex", gap: "24px" }}>
                          <div style={{ zIndex: 10, backgroundColor: isShipped ? "var(--color-primary)" : "var(--color-surface-container-highest)", color: isShipped ? "var(--color-on-primary)" : "rgba(64, 73, 69, 0.4)", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "14px", fontWeight: "bold" }}>local_shipping</span>
                          </div>
                          <div>
                            <h4 className="form-label" style={{ marginBottom: "4px", color: isShipped ? "inherit" : "rgba(64, 73, 69, 0.6)" }}>In Transit</h4>
                            <p style={{ fontSize: "14px", color: isShipped ? "var(--color-on-surface)" : "rgba(64, 73, 69, 0.6)" }}>Departed from distribution center.</p>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Delivered */}
                      {!isRefunded && (
                        <div style={{ display: "flex", gap: "24px" }}>
                          <div style={{ zIndex: 10, backgroundColor: isDelivered ? "var(--color-primary)" : "var(--color-surface-container-highest)", color: isDelivered ? "var(--color-on-primary)" : "rgba(64, 73, 69, 0.4)", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "14px", fontWeight: "bold" }}>home</span>
                          </div>
                          <div>
                            <h4 className="form-label" style={{ marginBottom: "4px", color: isDelivered ? "inherit" : "rgba(64, 73, 69, 0.6)" }}>Delivered</h4>
                            <p style={{ fontSize: "14px", color: isDelivered ? "var(--color-on-surface)" : "rgba(64, 73, 69, 0.6)" }}>Final delivery at your specified address.</p>
                          </div>
                        </div>
                      )}

                      {/* Refunded */}
                      {isRefunded && (
                        <div style={{ display: "flex", gap: "24px" }}>
                          <div style={{ zIndex: 10, backgroundColor: "var(--color-error)", color: "var(--color-on-error)", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "14px", fontWeight: "bold" }}>assignment_return</span>
                          </div>
                          <div>
                            <h4 className="form-label" style={{ marginBottom: "4px" }}>Refunded / Exchanged</h4>
                            <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)" }}>The order has been refunded or exchanged.</p>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
            {/* Order Sidebar */}
            <div className="order-details-sidebar">
              {/* Delivery Details */}
              <div className="delivery-details-card">
                <h4 className="delivery-details-title">Delivery Details</h4>
                <div className="delivery-details-info">
                  <div>
                    <p className="delivery-details-info-label">Shipping Address</p>
                    <p className="delivery-details-info-value">
                      Eleanor Thorne
                      <br />
                      12 Cavendish Square
                      <br />
                      London, W1G 9DB
                      <br />
                      United Kingdom
                    </p>
                  </div>
                  <div>
                    <p className="delivery-details-info-label">Courier</p>
                    <p className="delivery-details-info-value">Global Express Premium</p>
                  </div>
                  <div>
                    <p className="delivery-details-info-label">Tracking Number</p>
                    <p className="delivery-details-info-value" style={{ fontWeight: "600", letterSpacing: "0.05em" }}>
                      {orderId || "MARB-8829-XL04"}
                    </p>
                    {orderDetails && orderDetails.trackingLink && (
                      <a 
                        href={orderDetails.trackingLink} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ display: "inline-block", marginTop: "8px", fontSize: "12px", color: "var(--color-primary)", textDecoration: "underline" }}
                      >
                        Track via {orderDetails.trackingPartner || "Partner"}
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {/* Item Preview Card */}
              {orderDetails ? orderDetails.items.map((item: any, i: number) => (
                <div key={i} className="tracking-item-preview" style={{ marginBottom: "16px" }}>
                  <div className="tracking-item-img-wrap">
                    <img alt={item.name} src={item.image} />
                  </div>
                  <div className="tracking-item-info">
                    <h5>{item.name}</h5>
                    <p>Qty: {item.quantity}</p>
                    <p className="tracking-item-price">₹{item.price.toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <div className="tracking-item-preview">
                  <div className="tracking-item-img-wrap">
                    <img
                      alt="Pendant necklace"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYFw8ICEZ8ZaKua-vZb1X6JIw-N-hxVZbMQV9c7u9KE4SWfc_o6J4dmYlE18eM58arsqnB3FG690Ek7kOaQJScc_BnMWpsKy3b5WreTCAf5I4U66NyPNj4YNWWAFgE_sShlWh4GpTqzYoyJGqIaAGHCUCzxGoBykHwyfZl8OsnwQRLud_aF0xAuHgvMny80dK9_kPiqfgrmAgLQcJHmXPje7-uaH5PhZvGSP1MtCn0PBiPEJQrpWPKg0qtLaxYA82oSNYfmtPIi4AJ"
                    />
                  </div>
                  <div className="tracking-item-info">
                    <h5>Eternal Emerald Pendant</h5>
                    <p>18k Yellow Gold / 2ct Emerald</p>
                    <p className="tracking-item-price">₹2,89,900</p>
                  </div>
                </div>
              )}
              {/* Download Invoice Button */}
              {orderDetails && (
                <div style={{ textAlign: "center", paddingTop: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--color-outline-variant)" }}>
                  <button
                    onClick={() => handleDownloadInvoice(orderDetails)}
                    className="btn-primary hover-scale"
                    style={{
                      width: "100%",
                      padding: "14px 24px",
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-on-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "13px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase"
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                      download
                    </span>
                    Download Invoice (PDF)
                  </button>
                </div>
              )}
              {/* Support Button */}
              <div style={{ textAlign: "center", paddingTop: "16px" }}>
                <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", marginBottom: "16px" }}>
                  Need assistance with your delivery?
                </p>
                <button
                  className="btn-primary hover-scale"
                  style={{
                    backgroundColor: "transparent",
                    color: "var(--color-primary)",
                    border: "1px solid var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    support_agent
                  </span>
                  Contact Concierge
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: "120px", textAlign: "center", minHeight: "80vh" }}>Loading tracking information...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
