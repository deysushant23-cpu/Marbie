"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export default function WishlistPage() {
  const { wishlistItems, addToCart, removeFromWishlist } = useCart();

  const handleMoveToBag = (item: any) => {
    addToCart({ id: item.id, name: item.name, price: item.price, image: item.image });
    removeFromWishlist(item.id);
  };

  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "120px", minHeight: "80vh" }}>
      <h1 className="section-title">Your Wishlist</h1>
      <div className="section-divider"></div>

      {wishlistItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--color-outline)", marginBottom: "16px" }}>
            favorite_border
          </span>
          <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "24px" }}>Your wishlist is currently empty.</p>
          <Link href="/bracelets">
            <button className="btn-primary" style={{ width: "auto", padding: "16px 32px" }}>DISCOVER PIECES</button>
          </Link>
        </div>
      ) : (
        <motion.div layout className="products-grid">
          <AnimatePresence>
            {wishlistItems.map((item) => (
              <motion.div 
                key={item.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.25 } }}
                whileHover={{ y: -6 }}
                className="product-card hover-lift" 
                style={{ position: "relative" }}
              >
                <Link 
                  href={`/product/${item.id}`} 
                  style={{ position: "absolute", inset: 0, zIndex: 1 }}
                  aria-label={`View ${item.name}`}
                />
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromWishlist(item.id);
                  }}
                  style={{ 
                    position: "absolute", top: "16px", right: "16px", zIndex: 10,
                    background: "white", border: "none", borderRadius: "50%",
                    width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--color-error)" }}>close</span>
                </button>
                
                <div className="product-image-wrapper">
                  <img alt={item.name} src={item.image} />
                  <div className="image-overlay"></div>
                  <button 
                    className="add-to-bag-btn hover-scale" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMoveToBag(item);
                    }}
                    style={{ position: "relative", zIndex: 10 }}
                  >
                    MOVE TO BAG
                  </button>
                </div>
                <div className="product-info" style={{ position: "relative", zIndex: 2, pointerEvents: "none" }}>
                  <h3 className="product-name">{item.name}</h3>
                  <p className="product-price">₹{item.price.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
