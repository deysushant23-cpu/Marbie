"use client";

import React, { useEffect } from "react";
import { useCart } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function CustomerLoginPage() {
  const { setShowAuthModal } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      setShowAuthModal(true);
    }
  }, [status, setShowAuthModal]);

  return (
    <div className="container" style={{ paddingTop: "140px", paddingBottom: "120px", minHeight: "80vh" }}>
      {session?.user ? (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          
          {/* Header Banner - Luxury Client Card */}
          <div style={{ 
            position: "relative",
            backgroundColor: "var(--color-surface-container)", 
            borderRadius: "24px", 
            padding: "48px",
            border: "1px solid var(--color-outline-variant)",
            display: "flex",
            alignItems: "center",
            gap: "32px",
            marginBottom: "40px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
            overflow: "hidden"
          }}>
            {/* Subtle background pattern/glow */}
            <div style={{ position: "absolute", top: "-50%", right: "-10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(200, 169, 81, 0.1) 0%, rgba(0,0,0,0) 70%)", zIndex: 0 }}></div>
            
            {session.user.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name || "User"} 
                style={{
                  width: "120px", 
                  height: "120px", 
                  borderRadius: "50%", 
                  objectFit: "cover",
                  border: "2px solid var(--color-primary)",
                  boxShadow: "0 12px 32px rgba(200, 169, 81, 0.15)",
                  zIndex: 1
                }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div style={{ 
                width: "120px", 
                height: "120px", 
                borderRadius: "50%", 
                backgroundColor: "var(--color-surface)", 
                color: "var(--color-primary)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                fontSize: "48px", 
                fontWeight: 700,
                fontFamily: "var(--font-serif)",
                border: "2px solid var(--color-primary)",
                boxShadow: "0 12px 32px rgba(200, 169, 81, 0.15)",
                zIndex: 1
              }}>
                {session.user.name ? session.user.name.charAt(0).toUpperCase() : "M"}
              </div>
            )}
            
            <div style={{ flex: 1, zIndex: 1 }}>
              <p style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px", color: "var(--color-primary)", margin: "0 0 8px 0", fontWeight: 600 }}>Exclusive Client</p>
              <h1 style={{ fontSize: "36px", fontFamily: "var(--font-serif)", color: "var(--color-on-surface)", margin: "0 0 12px 0" }}>
                Welcome, {session.user.name || "Couture Client"}
              </h1>
              <p style={{ fontSize: "15px", color: "var(--color-on-surface-variant)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#4CAF50" }}>verified</span>
                Verified Member • {session.user.email}
              </p>
            </div>
            
            <div style={{ zIndex: 1 }}>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{ 
                  padding: "14px 28px", 
                  borderRadius: "12px", 
                  backgroundColor: "rgba(186, 26, 26, 0.05)", 
                  color: "#ba1a1a", 
                  border: "1px solid rgba(186, 26, 26, 0.2)", 
                  fontWeight: 600, 
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(186, 26, 26, 0.1)")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(186, 26, 26, 0.05)")}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
                Sign Out
              </button>
            </div>
          </div>

          {/* Grid Options */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            
            {/* Wishlist Card */}
            <div 
              onClick={() => router.push("/wishlist")}
              style={{ 
                backgroundColor: "var(--color-surface)", 
                border: "1px solid var(--color-outline-variant)", 
                borderRadius: "20px", 
                padding: "36px",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
                textAlign: "center",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.08)";
                e.currentTarget.style.borderColor = "var(--color-primary)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--color-outline-variant)";
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--color-primary)", marginBottom: "16px" }}>favorite</span>
              <h3 style={{ fontSize: "20px", fontFamily: "var(--font-serif)", color: "var(--color-on-surface)", margin: "0 0 12px 0" }}>My Wishlist</h3>
              <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", margin: 0, lineHeight: 1.6 }}>View your curated collection of bespoke bridal pieces and high-end jewelry.</p>
            </div>

            {/* Orders Card */}
            <div 
              onClick={() => router.push("/cart")}
              style={{ 
                backgroundColor: "var(--color-surface)", 
                border: "1px solid var(--color-outline-variant)", 
                borderRadius: "20px", 
                padding: "36px",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
                textAlign: "center"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.08)";
                e.currentTarget.style.borderColor = "var(--color-primary)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--color-outline-variant)";
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--color-primary)", marginBottom: "16px" }}>shopping_bag</span>
              <h3 style={{ fontSize: "20px", fontFamily: "var(--font-serif)", color: "var(--color-on-surface)", margin: "0 0 12px 0" }}>My Shopping Bag</h3>
              <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", margin: 0, lineHeight: 1.6 }}>Continue to checkout with your selected items and secure your order.</p>
            </div>

            {/* Address Card */}
            <div 
              style={{ 
                backgroundColor: "var(--color-surface)", 
                border: "1px solid var(--color-outline-variant)", 
                borderRadius: "20px", 
                padding: "36px",
                textAlign: "center",
                opacity: 0.7
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--color-on-surface-variant)", marginBottom: "16px" }}>location_on</span>
              <h3 style={{ fontSize: "20px", fontFamily: "var(--font-serif)", color: "var(--color-on-surface)", margin: "0 0 12px 0" }}>Saved Addresses</h3>
              <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", margin: 0, lineHeight: 1.6 }}>Manage your shipping addresses for faster checkout.</p>
              <span style={{ display: "inline-block", marginTop: "16px", padding: "4px 12px", borderRadius: "100px", backgroundColor: "var(--color-surface-container)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Coming Soon</span>
            </div>

          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", paddingTop: "80px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--color-surface-container)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "var(--color-on-surface-variant)" }}>lock</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "var(--color-on-surface)", marginBottom: "16px" }}>Authentication Required</h2>
          <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "32px" }}>Please log in to view your dashboard.</p>
          <button 
            className="btn-primary" 
            onClick={() => setShowAuthModal(true)}
            style={{ padding: "16px 32px", borderRadius: "12px", fontSize: "15px", letterSpacing: "1px" }}
          >
            SIGN IN NOW
          </button>
        </div>
      )}
    </div>
  );
}
