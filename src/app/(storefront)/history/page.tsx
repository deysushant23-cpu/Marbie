"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart, CartItem } from "@/components/CartContext";
import { useSession } from "next-auth/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion } from "framer-motion";

interface Order {
  id: string;
  date: string;
  total?: number;
  amount?: number;
  items: CartItem[];
  status: string;
  paymentMethod?: string;
  shippingAddress?: any;
}

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { customerUser } = useCart();
  const { data: session } = useSession();

  useEffect(() => {
    const localHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
    setOrders(localHistory);

    const email = customerUser?.email || session?.user?.email || "";
    const phone = customerUser?.phone || (session?.user as any)?.phone || "";
    const name = customerUser?.name || session?.user?.name || "";
    const userId = (session?.user as any)?.id || customerUser?.phone || customerUser?.email || session?.user?.email || "";

    const params = new URLSearchParams();
    if (email) params.append("email", email);
    if (phone) params.append("phone", phone);
    if (userId) params.append("userId", userId);
    if (name) params.append("name", name);

    if (params.toString()) {
      fetch(`/api/orders?${params.toString()}`)
        .then(res => res.json())
        .then(serverOrders => {
          if (Array.isArray(serverOrders)) {
            const combined = [...localHistory];
            serverOrders.forEach(so => {
              if (!combined.some(c => c.id === so.id)) {
                combined.push(so);
              }
            });
            setOrders(combined);
          }
        })
        .catch(err => console.error("Could not sync server orders:", err));
    }
  }, [customerUser, session]);

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
      <div style="font-size: 14px; font-weight: 600; color: #334155; margin-top: 4px;">#${order.id}</div>
    </div>
  </div>

  <div style="height: 1px; background-color: #e2e8f0; margin: 32px 0;"></div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
    <div>
      <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Billed To</div>
      <div style="font-size: 15px; font-weight: 600; color: #0f172a;">${order.shippingAddress?.fullName || 'Valued Customer'}</div>
      <div style="font-size: 13px; color: #64748b; margin-top: 4px; line-height: 1.5;">
        ${order.shippingAddress?.address || 'Direct Storefront Purchase'}<br>
        ${order.shippingAddress?.city ? `${order.shippingAddress.city}, ${order.shippingAddress.state || ''} ${order.shippingAddress.zipCode || ''}` : 'Customer Account'}
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Invoice Details</div>
      <div style="font-size: 13px; color: #64748b;"><strong style="color: #1e293b;">Date Issued:</strong> ${order.date}</div>
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
      ${order.items.map((item: any) => `
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
      pdf.save(`Invoice_${order.id}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF invoice:", err);
      alert("Failed to generate PDF invoice. Please try again.");
    } finally {
      document.body.removeChild(container);
    }
  };



  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "120px", minHeight: "80vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "24px" }}>
        <h1 className="section-title">Product History</h1>
        <Link href="/track-order">
          <span style={{ fontSize: "14px", color: "var(--color-secondary)", textDecoration: "underline", textUnderlineOffset: "4px" }}>
            Track a different order
          </span>
        </Link>
      </div>
      <div className="section-divider" style={{ marginBottom: "48px" }}></div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "24px" }}>You haven't placed any orders yet.</p>
          <Link href="/bracelets">
            <button className="btn-primary" style={{ width: "auto", padding: "16px 32px" }}>START SHOPPING</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
          {orders.map((order, orderIdx) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: orderIdx * 0.1 }}
              className="hover-lift"
              style={{ border: "1px solid var(--color-outline-variant)", backgroundColor: "var(--color-surface)", padding: "32px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--color-outline-variant)", paddingBottom: "24px", marginBottom: "24px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                    Order {order.id}
                  </h2>
                  <p style={{ color: "var(--color-on-surface-variant)", fontSize: "14px" }}>Placed on {order.date}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "20px", fontWeight: 600, color: "var(--color-primary)", marginBottom: "8px" }}>
                    ₹{(order.total !== undefined ? order.total : (order as any).amount || 0).toLocaleString()}
                  </p>
                  <Link href={`/track-order?orderId=${order.id}`} style={{ textDecoration: "none" }}>
                    <span style={{ backgroundColor: "var(--color-surface-container-high)", color: "var(--color-on-surface)", padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer" }}>
                      {order.status}
                    </span>
                  </Link>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
                {order.items.map((item, index) => (
                  <div key={index} style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <img src={item.image} alt={item.name} style={{ width: "64px", height: "64px", objectFit: "cover" }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "14px" }}>{item.name}</p>
                      <p style={{ color: "var(--color-on-surface-variant)", fontSize: "12px" }}>Qty: {item.quantity} | ₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Link href={`/track-order?orderId=${order.id}`}>
                  <button 
                    className="btn-primary hover-scale" 
                    style={{ width: "auto", padding: "12px 24px" }}
                  >
                    TRACK ORDER
                  </button>
                </Link>
                <button 
                  className="btn-primary hover-scale" 
                  onClick={() => handleDownloadInvoice(order)}
                  style={{ width: "auto", padding: "12px 24px", backgroundColor: "transparent", color: "var(--color-primary)", border: "1px solid var(--color-primary)" }}
                >
                  DOWNLOAD INVOICE
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
