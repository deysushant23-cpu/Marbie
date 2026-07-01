import os

FILE_PATH = r"src\app\(storefront)\lookbook\page.tsx"

def main():
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Add imports
    imports_to_add = """import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { isVideo } from "@/lib/media";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
"""
    
    # Replace old imports
    old_imports = """import React, { useState, useEffect } from "react";
import Link from "next/link";
import { isVideo } from "@/lib/media";
import { motion } from "framer-motion";
import Image from "next/image";"""
    
    if old_imports in content:
        content = content.replace(old_imports, imports_to_add)

    # Insert Faux3DSlider component
    faux_3d_slider_code = """
function Faux3DSlider({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4000);
  }, [images.length]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  }, []);

  useEffect(() => {
    if (images.length > 1) {
      startAutoPlay();
    }
    return stopAutoPlay;
  }, [images.length, startAutoPlay, stopAutoPlay]);

  useGSAP(() => {
    if (!containerRef.current || images.length === 0) return;
    const cards = gsap.utils.toArray(".slider-card") as HTMLElement[];
    
    cards.forEach((card, i) => {
      let offset = i - activeIndex;
      // Handle infinite loop visual math
      if (offset > Math.floor(images.length / 2)) offset -= images.length;
      if (offset < -Math.floor(images.length / 2)) offset += images.length;

      const isCenter = offset === 0;
      const absOffset = Math.abs(offset);
      
      const xPercent = offset * 45;
      const scale = isCenter ? 1 : Math.max(0.6, 1 - absOffset * 0.15);
      const zIndex = 100 - absOffset;
      const opacity = absOffset > 2 ? 0 : isCenter ? 1 : 0.6;
      const rotateY = -offset * 15;

      gsap.to(card, {
        xPercent,
        scale,
        zIndex,
        opacity,
        rotateY,
        duration: 0.8,
        ease: "power3.out",
        overwrite: "auto"
      });
    });
  }, { dependencies: [activeIndex, images.length], scope: containerRef });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    stopAutoPlay();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const diff = dragStartX.current - e.clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setActiveIndex((prev) => (prev + 1) % images.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
      }
      dragStartX.current = e.clientX; // reset to avoid rapid firing
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    startAutoPlay();
  };

  if (!images || images.length === 0) return null;

  return (
    <div 
      className="faux-3d-slider" 
      style={{ padding: "64px 0", perspective: "1200px", overflow: "hidden", userSelect: "none", touchAction: "pan-y" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="container" style={{ textAlign: "center", marginBottom: "40px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", color: "var(--color-on-surface)", letterSpacing: "0.2em", textTransform: "uppercase" }}>FEATURED COLLECTIONS</h2>
        <p style={{ color: "var(--color-on-surface-variant)", marginTop: "8px" }}>Drag or swipe to explore.</p>
      </div>
      <div 
        ref={containerRef} 
        style={{ position: "relative", height: "500px", display: "flex", justifyContent: "center", alignItems: "center", transformStyle: "preserve-3d" }}
      >
        {images.map((img, i) => (
          <div 
            key={i} 
            className="slider-card"
            style={{ position: "absolute", width: "80%", maxWidth: "360px", height: "480px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", cursor: isDragging ? "grabbing" : "grab", transformOrigin: "center center" }}
            onClick={() => setActiveIndex(i)}
          >
            {isVideo(img) ? (
              <video src={img} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Image src={img} alt={`Slide ${i}`} fill style={{ objectFit: "cover", pointerEvents: "none" }} quality={90} />
            )}
          </div>
        ))}
      </div>
      
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "32px" }}>
        {images.map((_, i) => (
          <button 
            key={i}
            onClick={() => setActiveIndex(i)}
            style={{ width: i === activeIndex ? "24px" : "8px", height: "8px", borderRadius: "8px", backgroundColor: i === activeIndex ? "var(--color-primary)" : "var(--color-outline)", border: "none", transition: "all 0.3s ease", cursor: "pointer", padding: 0 }}
            aria-label={`Go to slide ${i+1}`}
          />
        ))}
      </div>
    </div>
  );
}

"""
    
    if "function Faux3DSlider" not in content:
        # Insert before LookbookPage
        content = content.replace("export default function LookbookPage() {", faux_3d_slider_code + "export default function LookbookPage() {")

    # Insert slider instantiation inside LookbookPage return
    insertion_marker = '<div className="container" style={{ padding: "64px 24px" }}>'
    slider_usage = """      {config?.storefront?.lookbookSlider?.length > 0 && (
        <Faux3DSlider images={config.storefront.lookbookSlider} />
      )}
      
      <div className="container" style={{ padding: "64px 24px" }}>"""
    
    if "Faux3DSlider images=" not in content:
        content = content.replace(insertion_marker, slider_usage)

    with open(FILE_PATH, "w", encoding="utf-8") as f:
        f.write(content)
        print("Updated lookbook/page.tsx successfully!")

if __name__ == "__main__":
    main()
