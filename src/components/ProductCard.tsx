import React from "react";
import { useCart } from "@/components/CartContext";
import Link from "next/link";
import Image from "next/image";
import { isVideo } from "@/lib/media";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export interface ProductProps {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  badge?: string;
  isExclusive?: boolean;
  rating?: number;
  reviewCount?: number;
  colors?: { name: string; hex: string }[];
  originalPrice?: number;
  images?: string[];
  weight?: string | number;
}

export default function ProductCard({ product }: { product: ProductProps }) {
  const router = useRouter();
  const { addToCart, requireCustomerAuth, wishlistItems, addToWishlist, removeFromWishlist } = useCart();
  const isWishlisted = wishlistItems.some(item => item.id === product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        weight: product.weight
      });
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      image: product.image,
      weight: product.weight
    });
  };

  const origPrice = product.originalPrice;
  const hasDiscount = origPrice !== undefined && origPrice > product.price;
  const discountPercent = hasDiscount ? Math.round(((origPrice - product.price) / origPrice) * 100) : 0;

  const secondImage = product.images && product.images.length > 0 
    ? product.images.find(img => img !== product.image) || product.images[0] 
    : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      whileHover="hover"
      onClick={() => router.push(`/product/${product.id}`)}
      className="product-card hover-lift" 
      style={{ position: "relative", cursor: "pointer" }}
      variants={{
        hover: { y: -6, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } }
      }}
    >
      <Link 
        href={`/product/${product.id}`} 
        style={{ position: "absolute", inset: 0, zIndex: 15 }}
        aria-label={`View ${product.name}`}
      />
      <div className="product-img-wrap">
        {(product.badge || hasDiscount) && (
          <div className="product-discount-badge animate-pulse-glow">
            {product.badge || `-${discountPercent}%`}
          </div>
        )}

        {product.image && isVideo(product.image) ? (
          <video autoPlay loop muted playsInline className="product-img" src={product.image} />
        ) : (
          <>
            <motion.div 
              variants={{ hover: { opacity: secondImage ? 0 : 1 } }} 
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}
            >
              <Image alt={product.name} src={product.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCcIZXO82aWHKwgWbLCSx0uVJtIwMEw9sznR7JiZ_ZG1f0d6uiLC8iSPj_3u39wBB0r5z0O-JQxzzUI55yX2tTFslcPLhsoDf523TLoMJNDKt5wp3qhl0t5Hy5CVkTxWlGhMXXQDBOu2nPOXnkl7YFuOJVoziCb8P_6ldZ0wI8ZKhnUwydEkUoa8_u1lH6NlFwIsRvyp42ZCLKK_rPXzMiHT2vkobzr3JMmkTJlqlvHpnBvaTmUKkC3Oucv9fOaGOe_V8sZsrrfgWqS"} className="product-img" fill style={{ objectFit: "cover" }} quality={90} />
            </motion.div>
            
            {secondImage && (
              <motion.div 
                initial={{ opacity: 0 }}
                variants={{ hover: { opacity: 1 } }} 
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 2 }}
              >
                {isVideo(secondImage) ? (
                  <video autoPlay loop muted playsInline className="product-img" src={secondImage} style={{ objectFit: "cover" }} />
                ) : (
                  <Image alt={`${product.name} alternate view`} src={secondImage} className="product-img" fill style={{ objectFit: "cover" }} quality={90} />
                )}
              </motion.div>
            )}
          </>
        )}

        {/* Circular Overlay Quick Actions Bar */}
        <motion.div 
          className="card-overlay-actions" 
          style={{ zIndex: 20 }}
          variants={{
            hover: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.05 } }
          }}
          initial={{ opacity: 0, y: 10 }}
        >
          <motion.button 
            variants={{ hover: { opacity: 1, y: 0 }, initial: { opacity: 0, y: 10 } }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="action-circle-btn" 
            onClick={handleQuickAdd} 
            title="Quick Add to Bag"
            type="button"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>shopping_bag</span>
          </motion.button>

          <motion.button 
            variants={{ hover: { opacity: 1, y: 0 }, initial: { opacity: 0, y: 10 } }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className={`action-circle-btn ${isWishlisted ? "active" : ""}`}
            onClick={toggleWishlist}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            type="button"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: `'FILL' ${isWishlisted ? 1 : 0}` }}>favorite</span>
          </motion.button>

          <motion.div 
            variants={{ hover: { opacity: 1, y: 0 }, initial: { opacity: 0, y: 10 } }}
            whileHover={{ scale: 1.15 }} 
            whileTap={{ scale: 0.9 }} 
            style={{ zIndex: 21 }}
          >
            <Link 
              href={`/product/${product.id}`} 
              className="action-circle-btn" 
              style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
              title="Quick View Details"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>visibility</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <div style={{ marginTop: "12px" }}>
        <p className="product-desc" style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.15em", color: "var(--color-on-surface-variant)", textTransform: "uppercase", margin: "0 0 4px 0" }}>
          {(product as any).subcategory || product.category}
        </p>
        <h4 className="product-title" style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-primary)", margin: "0 0 6px 0", lineHeight: "1.3" }}>
          {product.name}
        </h4>
        
        {product.reviewCount !== undefined && product.reviewCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", margin: "4px 0", fontSize: "13px", color: "var(--color-on-surface-variant)" }}>
            <div style={{ color: "#FFB400", display: "flex" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="material-symbols-outlined" style={{ fontSize: "15px", fontVariationSettings: `'FILL' ${(product.rating || 0) >= star ? 1 : 0}` }}>
                  star
                </span>
              ))}
            </div>
            <span>({product.reviewCount})</span>
          </div>
        )}

        <div className="price-line-wrap">
          {hasDiscount && <span className="price-original">₹{origPrice.toLocaleString()}</span>}
          <span className="price-current">₹{product.price.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}

