"use client";

import React from "react";
import { motion } from "framer-motion";

export default function MaintenanceScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-surface)", padding: "24px", textAlign: "center" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ maxWidth: "600px" }}
      >
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "48px", color: "var(--color-primary)", margin: 0, letterSpacing: "0.05em" }}>MARBIE JEWELS</h1>
        </div>
        
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "32px", color: "var(--color-on-surface)", marginBottom: "16px" }}>
          We are upgrading our boutique.
        </h2>
        
        <p style={{ fontSize: "16px", color: "var(--color-on-surface-variant)", lineHeight: 1.8, marginBottom: "48px" }}>
          To provide you with the most exquisite experience, our digital storefront is currently undergoing scheduled enhancements. We will return shortly with our latest collections.
        </p>

        <div style={{ width: "40px", height: "1px", backgroundColor: "var(--color-primary)", margin: "0 auto 48px auto" }}></div>

        <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--color-on-surface-variant)" }}>
          Thank you for your patience.
        </p>
      </motion.div>
    </div>
  );
}
