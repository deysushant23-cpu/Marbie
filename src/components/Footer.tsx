"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error("Failed to load config", err));
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        const res = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        if (res.ok) {
          setSubscribed(true);
          setEmail("");
          setTimeout(() => setSubscribed(false), 5000);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <motion.footer 
      initial={{ opacity: 0 }} 
      whileInView={{ opacity: 1 }} 
      viewport={{ once: true }} 
      transition={{ duration: 0.8 }} 
      className="footer"
      style={{ 
        backgroundColor: "#fadadd", // Baby light pink
        color: "#05110d",
        paddingTop: "60px",
        paddingBottom: "30px",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Decorative Jewelry PNG Mockups */}
      <img src="/images/Neckles1.png" alt="" style={{ position: "absolute", top: "-50px", left: "-80px", height: "300px", objectFit: "contain", opacity: 0.3, transform: "rotate(-15deg)", pointerEvents: "none" }} />
      <img src="/images/neckles4.png" alt="" style={{ position: "absolute", bottom: "-60px", right: "-40px", height: "250px", objectFit: "contain", opacity: 0.25, transform: "rotate(25deg)", pointerEvents: "none" }} />
      <img src="/images/Neckles3.png" alt="" style={{ position: "absolute", top: "50%", left: "50%", height: "400px", objectFit: "contain", opacity: 0.1, transform: "translate(-50%, -50%) rotate(5deg)", pointerEvents: "none" }} />

      <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "48px", paddingBottom: "48px", borderBottom: "1px solid rgba(0,0,0,0.05)", position: "relative", zIndex: 1 }}>
        
        {/* Brand Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: "700", color: "#05110d", letterSpacing: "0.05em" }}>
              {config?.footer?.brandName || "Marbie Jewels"}
            </h2>
          </Link>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "rgba(5,17,13,0.7)", margin: 0, maxWidth: "300px" }}>
            {config?.footer?.description || "Curating beautiful pieces for the modern woman who values understated elegance and contemporary design."}
          </p>
          <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
            {config?.navigation?.social ? (
              config.navigation.social.map((social: any, i: number) => (
                <a key={i} href={social.href} aria-label="Social Link" style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid rgba(5,17,13,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#05110d", transition: "all 0.3s ease", textDecoration: "none", backgroundColor: "rgba(255,255,255,0.3)" }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#05110d"; e.currentTarget.style.color = "#fadadd"; e.currentTarget.style.borderColor = "#05110d"; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "#05110d"; e.currentTarget.style.borderColor = "rgba(5,17,13,0.2)"; }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{social.icon}</span>
                </a>
              ))
            ) : (
              <>
                <a href="#" aria-label="Social Link" style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid rgba(5,17,13,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#05110d", transition: "all 0.3s ease", textDecoration: "none", backgroundColor: "rgba(255,255,255,0.3)" }}><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>public</span></a>
                <a href="#" aria-label="Email Link" style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid rgba(5,17,13,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#05110d", transition: "all 0.3s ease", textDecoration: "none", backgroundColor: "rgba(255,255,255,0.3)" }}><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>mail</span></a>
              </>
            )}
          </div>
        </div>
        
        {/* Navigation Links */}
        <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
          <div style={{ minWidth: "120px" }}>
            <h4 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", color: "#05110d", textTransform: "uppercase", marginBottom: "20px" }}>SUPPORT</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {config?.navigation?.support ? (
                config.navigation.support.map((link: any) => (
                  <li key={link.href}>
                    <Link href={link.href} style={{ textDecoration: "none", color: "rgba(5,17,13,0.8)", fontSize: "14px", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#000"} onMouseOut={(e) => e.currentTarget.style.color = "rgba(5,17,13,0.8)"}>{link.name}</Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/track-order" style={{ textDecoration: "none", color: "rgba(5,17,13,0.8)", fontSize: "14px" }}>Track Order</Link></li>
                  <li><Link href="/info/shipping-and-returns" style={{ textDecoration: "none", color: "rgba(5,17,13,0.8)", fontSize: "14px" }}>Shipping & Delivery</Link></li>
                  <li><Link href="/info/refund-policy" style={{ textDecoration: "none", color: "rgba(5,17,13,0.8)", fontSize: "14px" }}>Returns & Cancellations</Link></li>
                  <li><Link href="/info/care-guide" style={{ textDecoration: "none", color: "rgba(5,17,13,0.8)", fontSize: "14px" }}>Care Guide</Link></li>
                </>
              )}
            </ul>
          </div>
          <div style={{ minWidth: "120px" }}>
            <h4 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", color: "#05110d", textTransform: "uppercase", marginBottom: "20px" }}>COMPANY</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {config?.navigation?.company ? (
                config.navigation.company.map((link: any) => (
                  <li key={link.href}>
                    <Link href={link.href} style={{ textDecoration: "none", color: "rgba(5,17,13,0.8)", fontSize: "14px", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "#000"} onMouseOut={(e) => e.currentTarget.style.color = "rgba(5,17,13,0.8)"}>{link.name}</Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/info/about-us" style={{ textDecoration: "none", color: "rgba(5,17,13,0.8)", fontSize: "14px" }}>About Us</Link></li>
                  <li><Link href="/info/contact-us" style={{ textDecoration: "none", color: "rgba(5,17,13,0.8)", fontSize: "14px" }}>Contact Us</Link></li>
                  <li><Link href="/info/privacy-policy" style={{ textDecoration: "none", color: "rgba(5,17,13,0.8)", fontSize: "14px" }}>Privacy Policy</Link></li>
                  <li><Link href="/info/terms-of-service" style={{ textDecoration: "none", color: "rgba(5,17,13,0.8)", fontSize: "14px" }}>Terms of Service</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h4 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", color: "#05110d", textTransform: "uppercase", margin: 0 }}>THE MARBIE CLUB</h4>
          <AnimatePresence mode="wait">
            <motion.p 
              key={subscribed ? "sub" : "unsub"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              style={{ fontSize: "14px", color: "rgba(5,17,13,0.8)", margin: 0, lineHeight: 1.5 }}
            >
              {subscribed ? "Welcome to the club. Your royal access awaits." : "Join our exclusive circle for early access to new collections and private sales."}
            </motion.p>
          </AnimatePresence>
          <form onSubmit={handleSubscribe} style={{ position: "relative", display: "flex", marginTop: "4px" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
              style={{
                width: "100%",
                padding: "14px 18px",
                paddingRight: "110px",
                backgroundColor: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "6px",
                color: "#05110d",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.3s ease",
                backdropFilter: "blur(4px)"
              }}
              onFocus={(e) => e.target.style.borderColor = "#05110d"}
              onBlur={(e) => e.target.style.borderColor = "rgba(0,0,0,0.1)"}
            />
            <button 
              type="submit" 
              style={{
                position: "absolute",
                right: "5px",
                top: "5px",
                bottom: "5px",
                padding: "0 20px",
                backgroundColor: "#05110d",
                color: "#fadadd",
                border: "none",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#fed65b"; e.currentTarget.style.color = "#05110d"; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#05110d"; e.currentTarget.style.color = "#fadadd"; }}
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </div>
      
      {/* Bottom Footer */}
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", paddingTop: "24px", position: "relative", zIndex: 1 }}>
        <p style={{ margin: 0, fontSize: "12px", color: "rgba(5,17,13,0.6)" }}>
          {config?.footer?.copyright || "© 2026 Marbie Premium Jewelry. All Rights Reserved."}
        </p>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(5,17,13,0.5)", marginRight: "4px" }}>Secured By</span>
          <div style={{ backgroundColor: "#fff", padding: "3px 6px", borderRadius: "4px", display: "flex", alignItems: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" style={{ height: "12px", objectFit: "contain" }} />
          </div>
          <div style={{ backgroundColor: "#fff", padding: "3px 6px", borderRadius: "4px", display: "flex", alignItems: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" style={{ height: "12px", objectFit: "contain" }} />
          </div>
          <div style={{ backgroundColor: "#fff", padding: "3px 6px", borderRadius: "4px", display: "flex", alignItems: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" style={{ height: "12px", objectFit: "contain" }} />
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
