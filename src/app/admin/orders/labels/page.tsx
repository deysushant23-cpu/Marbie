"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Barcode from "react-barcode";

export default function LabelsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        const params = new URLSearchParams(window.location.search);
        const targetId = params.get('id');

        const activeOrders = data.filter((o: any) => o.status === "PROCESSING" || o.status === "READY_TO_DISPATCH" || o.id === targetId);
        setOrders(activeOrders);
        
        if (targetId && activeOrders.some((o: any) => o.id === targetId)) {
          setSelectedIds([targetId]);
        } else {
          // By default, select all active orders
          setSelectedIds(activeOrders.map((o: any) => o.id));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handlePrint = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one order to print.");
      return;
    }
    window.print();
  };

  const handleDownloadAuthenticEkartPdf = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one order to download.");
      return;
    }
    const selectedOrders = orders.filter(o => selectedIds.includes(o.id));
    const firstOrderWithAwb = selectedOrders.find(o => o.awbCode || o.trackingPartner === "Ekart Logistics") || selectedOrders[0];
    const targetWbn = firstOrderWithAwb?.awbCode || firstOrderWithAwb?.id.replace('#', '') || "";
    window.open(`/api/admin/shipping/label?wbn=${targetWbn}`, '_blank');
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map(o => o.id));
    }
  };

  if (loading) return <div style={{ padding: "48px" }}>Loading labels dashboard...</div>;

  const selectedOrders = orders.filter(o => selectedIds.includes(o.id));

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", padding: "24px" }}>
      {/* CSS specific to printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 20px !important;
          }
          .print-hide { display: none !important; }
          @page { margin: 0; size: auto; }
          .shipping-label {
            page-break-after: always;
            margin: 0 !important;
            border: none !important;
            width: 100% !important;
            max-width: 4in !important;
          }
        }
        
        .shipping-label {
          width: 380px;
          border: 2px solid #000;
          background: #fff;
          margin-bottom: 32px;
          font-family: "Courier New", Courier, monospace;
          color: #000;
        }
        .label-header { text-align: center; padding: 16px; border-bottom: 2px solid #000; }
        .label-section { padding: 16px; border-bottom: 2px solid #000; }
        .label-section:last-child { border-bottom: none; }
      `}} />

      <div className="print-hide" style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "24px", color: "#000", marginBottom: "8px", fontFamily: "var(--font-display, sans-serif)" }}>Print Shipping Labels</h1>
          <p style={{ color: "#666" }}>Select orders to preview and print their labels.</p>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <Link href="/admin/orders">
            <button className="btn" style={{ padding: "12px 24px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", borderRadius: "4px" }}>Back to Orders</button>
          </Link>
          <button 
            onClick={handleDownloadAuthenticEkartPdf} 
            disabled={selectedIds.length === 0} 
            style={{ padding: "12px 20px", cursor: selectedIds.length === 0 ? "not-allowed" : "pointer", backgroundColor: selectedIds.length === 0 ? "#ccc" : "#1a56db", color: "white", border: "none", borderRadius: "4px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>picture_as_pdf</span>
            Download Official Ekart PDF
          </button>
          <button className="btn-primary" onClick={handlePrint} disabled={selectedIds.length === 0} style={{ padding: "12px 24px", cursor: selectedIds.length === 0 ? "not-allowed" : "pointer", backgroundColor: selectedIds.length === 0 ? "#ccc" : "#063b2f", color: "white", border: "none", borderRadius: "4px" }}>
            <span className="material-symbols-outlined" style={{ verticalAlign: "middle", marginRight: "8px", fontSize: "18px" }}>print</span>
            Print {selectedIds.length} Labels
          </button>
        </div>
      </div>

      <div className="print-hide" style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "32px" }}>
        {/* Left Column: Order Selection Table */}
        <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #ddd", padding: "24px", overflow: "hidden" }}>
           <h3 style={{ marginBottom: "16px", color: "#000" }}>Active Orders</h3>
           <table style={{ width: "100%", borderCollapse: "collapse" }}>
             <thead>
               <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
                 <th style={{ padding: "12px 8px" }}>
                   <input type="checkbox" checked={selectedIds.length === orders.length && orders.length > 0} onChange={toggleAll} />
                 </th>
                 <th style={{ padding: "12px 8px", color: "#333", fontWeight: 600 }}>Order ID</th>
                 <th style={{ padding: "12px 8px", color: "#333", fontWeight: 600 }}>Customer</th>
                 <th style={{ padding: "12px 8px", color: "#333", fontWeight: 600 }}>Items</th>
               </tr>
             </thead>
             <tbody>
               {orders.length === 0 ? (
                 <tr>
                   <td colSpan={4} style={{ padding: "24px", textAlign: "center", color: "#666" }}>No active orders found.</td>
                 </tr>
               ) : (
                 orders.map((order) => (
                   <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                     <td style={{ padding: "12px 8px" }}>
                       <input type="checkbox" checked={selectedIds.includes(order.id)} onChange={() => toggleSelection(order.id)} />
                     </td>
                     <td style={{ padding: "12px 8px", fontWeight: "600", color: "#063b2f" }}>{order.id}</td>
                     <td style={{ padding: "12px 8px", color: "#000" }}>{order.customerName}</td>
                     <td style={{ padding: "12px 8px", color: "#666" }}>{order.items ? order.items.length : 0} items</td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
        </div>

        {/* Right Column: Live Label Preview */}
        <div style={{ background: "#e8e8e8", borderRadius: "8px", padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", maxHeight: "75vh", overflowY: "auto" }}>
           <h3 style={{ marginBottom: "24px", color: "#666", alignSelf: "flex-start" }}>Live Preview ({selectedOrders.length})</h3>
           
           <div className="print-area" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
             {selectedOrders.length === 0 ? (
               <p style={{ color: "#888" }}>Select an order to see preview.</p>
             ) : (
               selectedOrders.map((order) => {
                 const weight = order.items && order.items.length > 0 ? (order.items.length * 0.15).toFixed(2) : "0.25";
                 const addressString = typeof order.shippingAddress === 'string' ? order.shippingAddress : order.shippingAddress?.address || "No address provided";
                 const parts = addressString.split(",").map((s: string) => s.trim());
                 const cityStatePin = parts.length > 2 ? parts.slice(-3).join(", ") : parts.join(", ");
                 const addressLine1 = parts.length > 2 ? parts.slice(0, -3).join(", ") : "";
                 const mobile = order.shippingAddress?.phone || order.phone || order.shippingAddress?.mobile || "N/A";
                 const isCOD = Boolean(order.paymentMethod && (order.paymentMethod.toUpperCase().includes('COD') || order.paymentMethod.toLowerCase() === 'cod'));
                 const paymentDisplay = isCOD ? 'COD' : (order.paymentMethod ? `PAID (${order.paymentMethod})` : 'PAID');
                 
                 return (
                   <div key={order.id} className="shipping-label">
                     <div className="label-header" style={{ backgroundColor: "#2874f0", color: "#fff", borderBottom: "2px solid #000", padding: "10px" }}>
                       <div style={{ fontSize: "16px", fontWeight: "900", letterSpacing: "2px" }}>EKART LOGISTICS</div>
                       <div style={{ fontSize: "10px", opacity: 0.9 }}>SURFACE • PRIORITY DELIVERY</div>
                     </div>
                     <div className="label-header">
                       <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: "0 0 4px 0", letterSpacing: "1px", fontFamily: "sans-serif" }}>MARBIE JEWELS</h2>
                       <p style={{ margin: 0, fontSize: "12px", textTransform: "uppercase" }}>Premium Fashion Jewelry</p>
                     </div>
                     
                     <div className="label-section">
                       <p style={{ margin: "0 0 8px 0", fontWeight: "bold", textDecoration: "underline" }}>Ship To:</p>
                       <p style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "bold" }}>{order.shippingAddress?.fullName || order.customerName}</p>
                       {addressLine1 && <p style={{ margin: "0 0 4px 0", fontSize: "14px", lineHeight: "1.4" }}>{addressLine1}</p>}
                       <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}>{cityStatePin}</p>
                       <p style={{ margin: 0, fontSize: "14px" }}>Mobile: <span style={{ fontWeight: "bold" }}>{mobile}</span></p>
                     </div>
                     
                     <div className="label-section" style={{ display: "flex", justifyContent: "space-between" }}>
                       <div>
                         <p style={{ margin: "0 0 4px 0", fontSize: "14px" }}>Order ID: <span style={{ fontWeight: "bold" }}>{order.id}</span></p>
                         <p style={{ margin: "0 0 4px 0", fontSize: "14px" }}>Payment: <span style={{ fontWeight: "bold", color: isCOD ? '#ba1a1a' : '#063b2f' }}>{paymentDisplay}</span></p>
                         <p style={{ margin: 0, fontSize: "14px" }}>{isCOD ? 'To Collect:' : 'Value:'} <span style={{ fontWeight: "bold", fontSize: "16px" }}>₹{order.amount ? order.amount.toLocaleString() : "0"}</span></p>
                       </div>
                       <div style={{ textAlign: "right" }}>
                         <p style={{ margin: "0 0 4px 0", fontSize: "14px" }}>Weight: <span style={{ fontWeight: "bold" }}>{weight} kg</span></p>
                         <p style={{ margin: "0 0 4px 0", fontSize: "12px" }}>Items: {order.items ? order.items.length : 0}</p>
                       </div>
                     </div>

                     {/* Itemized Packing List */}
                     <div className="label-section" style={{ padding: "12px 16px", backgroundColor: "#fdfdfd" }}>
                       <p style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "bold", borderBottom: "1px solid #ddd", paddingBottom: "4px" }}>PACKING LIST:</p>
                       <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", lineHeight: "1.5" }}>
                         {order.items && order.items.length > 0 ? (
                           order.items.map((item: any, idx: number) => (
                             <li key={idx}>{item.quantity}x {item.name}</li>
                           ))
                         ) : (
                           <li>No item details available</li>
                         )}
                       </ul>
                     </div>
                     
                     <div className="label-section" style={{ textAlign: "center", padding: "24px 16px" }}>
                       <div style={{ display: "inline-block", maxWidth: "100%", overflow: "hidden" }}>
                         <Barcode 
                           value={order.awbCode || `EKART-${order.id.replace('#', '')}`} 
                           format="CODE128" 
                           width={2} 
                           height={60} 
                           displayValue={true} 
                           fontSize={14}
                           background="#ffffff"
                           lineColor="#000000"
                           margin={0}
                         />
                       </div>
                     </div>
                     <div className="print-hide" style={{ textAlign: "center", padding: "12px", backgroundColor: "#f0f4f8", borderTop: "1px dashed #ccc", borderBottom: "1px dashed #ccc" }}>
                       <a 
                         href={`/api/admin/shipping/label?wbn=${order.awbCode || order.id.replace('#', '')}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         style={{ color: "#1a56db", fontSize: "13px", fontWeight: "bold", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                       >
                         <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>download</span>
                         Download Authentic Ekart Logistics PDF Label
                       </a>
                     </div>
                     
                     <div className="label-section">
                       <p style={{ margin: "0 0 6px 0", fontWeight: "bold", fontSize: "13px" }}>Return Address:</p>
                       <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.4", whiteSpace: "pre-line" }}>
                         {"Marbie Jewels\n1/2308 khanderaopura near khan bakery, nanpura\nSurat, Gujarat - 395001\nPhone: 8160143146 | GST: 24BBOPR0323M1ZG"}
                       </p>
                     </div>
                   </div>
                 );
               })
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
