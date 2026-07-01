"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { isVideo } from "@/lib/media";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";



function Faux3DSlider({ images }: { images: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const autoPlayTween = useRef<gsap.core.Tween | null>(null);

  const cardWidth = 280;
  const radius = useMemo(() => {
    const effectiveLength = Math.max(images.length, 3);
    return Math.round((cardWidth / 2) / Math.tan(Math.PI / effectiveLength)) + 80;
  }, [images.length]);

  useGSAP(() => {
    if (!containerRef.current || images.length === 0) return;

    // Start infinite autoplay
    const startAutoPlay = () => {
      autoPlayTween.current = gsap.to(rotationRef.current, {
        y: "-=360",
        duration: 40,
        ease: "none",
        repeat: -1,
        onUpdate: () => {
          gsap.set(containerRef.current, { rotationY: rotationRef.current.y, rotationX: 0 });
        }
      });
    };
    
    startAutoPlay();

    return () => {
      if (autoPlayTween.current) autoPlayTween.current.kill();
    };
  }, { dependencies: [images.length, radius], scope: wrapperRef });

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    if (autoPlayTween.current) autoPlayTween.current.pause();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const deltaX = e.clientX - lastPos.current.x;
    lastPos.current = { x: e.clientX, y: e.clientY };
    
    rotationRef.current.y += deltaX * 0.5;
    
    gsap.set(containerRef.current, { rotationY: rotationRef.current.y, rotationX: 0 });
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    if (autoPlayTween.current) autoPlayTween.current.play();
  };

  if (!images || images.length === 0) return null;

  return (
    <div 
      className="faux-3d-slider" 
      ref={wrapperRef}
      style={{ padding: "80px 0", perspective: "1800px", overflow: "hidden", userSelect: "none", touchAction: "none", backgroundColor: "#000", color: "#fff", position: "relative" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="container" style={{ textAlign: "center", marginBottom: "80px", position: "relative", zIndex: 10 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "32px", color: "#fed65b", letterSpacing: "0.3em", textTransform: "uppercase" }}>360° CINEMATIC EXPERIENCE</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", marginTop: "12px", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Drag horizontally to spin the carousel</p>
      </div>
      
      <div 
        style={{ position: "relative", height: "60vh", minHeight: "500px", display: "flex", justifyContent: "center", alignItems: "center", transformStyle: "preserve-3d", transform: `translateZ(-${radius}px)` }}
      >
        <div 
          ref={containerRef}
          style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", display: "flex", justifyContent: "center", alignItems: "center" }}
        >
          {images.map((img, i) => (
            <div 
              key={i} 
              className="slider-card"
              style={{ 
                position: "absolute",
                width: `${cardWidth}px`, 
                height: "440px", 
                borderRadius: "16px", 
                overflow: "hidden", 
                boxShadow: "0 24px 80px rgba(0,0,0,0.9)", 
                transformStyle: "preserve-3d", 
                backfaceVisibility: "hidden",
                transform: `rotateY(${i * (360 / images.length)}deg) translateZ(${radius}px)`
              }}
            >
              {isVideo(img) ? (
                <video src={img} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
              ) : (
                <Image src={img} alt={`Slide ${i}`} fill style={{ objectFit: "cover", pointerEvents: "none" }} quality={90} />
              )}
              <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(255,255,255,0.15)", borderRadius: "16px", pointerEvents: "none" }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LookbookPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/lookbook").then(res => res.json()),
      fetch("/api/config").then(res => res.json())
    ])
      .then(([lookbookData, configData]) => {
        setItems(lookbookData);
        setConfig(configData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div style={{ padding: "120px 24px", textAlign: "center" }}>Loading Lookbook...</div>;

  // Group items by category
  const categories = Array.from(new Set(items.map(item => item.category)));

  const bannerUrl = config?.marketing?.lookbookBanner || "/images/lookbook_hero.png";
  const bannerTitle = config?.marketing?.lookbookTitle !== undefined ? config.marketing.lookbookTitle : "The Lookbook";
  const bannerSubtitle = config?.marketing?.lookbookSubtitle !== undefined ? config.marketing.lookbookSubtitle : "Explore our editorial galleries and styled collections.";
  const bannerRatio = config?.marketing?.lookbookBannerRatio || "default";
  const itemRatio = config?.marketing?.lookbookItemRatio || "3/4";

  const getBannerStyle = () => {
    if (bannerRatio === "tall") return { minHeight: "650px", position: "relative" as const, overflow: "hidden" };
    if (bannerRatio === "cinematic") return { aspectRatio: "16/9", position: "relative" as const, overflow: "hidden" };
    if (bannerRatio === "contain") return { minHeight: "450px", position: "relative" as const, overflow: "hidden", background: "var(--color-surface-container)" };
    return { minHeight: "400px", position: "relative" as const, overflow: "hidden" };
  };

  return (
    <>
      <section className="catalog-hero animate-fade-up" style={{ ...getBannerStyle(), backgroundImage: isVideo(bannerUrl) ? "none" : `url('${bannerUrl}')`, backgroundSize: bannerRatio === "contain" ? "contain" : "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
        {isVideo(bannerUrl) && (
          <video src={bannerUrl} autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: bannerRatio === "contain" ? "contain" : "cover", zIndex: 0 }} />
        )}
        <div className="hero-overlay" style={{ zIndex: 1 }}></div>
        <div className="hero-content" style={{ zIndex: 2, position: "relative" }}>
          <h1 className="hero-title animate-fade-up delay-1" style={{ whiteSpace: "pre-line" }}>{bannerTitle}</h1>
          <p className="hero-subtitle animate-fade-up delay-2" style={{ whiteSpace: "pre-line" }}>{bannerSubtitle}</p>
        </div>
      </section>

            {config?.storefront?.lookbookSlider?.length > 0 && (
        <Faux3DSlider images={config.storefront.lookbookSlider} />
      )}
      
      <div className="container" style={{ padding: "64px 24px" }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px", color: "var(--color-on-surface-variant)" }}>
            Coming Soon
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "80px" }}>
            {categories.map(category => {
              const categoryItems = items.filter(item => item.category === category);
              return (
                <div key={category as string}>
                  <div className="animate-fade-up delay-1" style={{ borderBottom: "1px solid rgba(115, 92, 0, 0.2)", paddingBottom: "16px", marginBottom: "32px" }}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "32px", color: "var(--color-on-surface)" }}>{category as string}</h2>
                  </div>
                  
                  <div className={config?.marketing?.lookbookStyle === "grid" ? "lookbook-grid-layout" : "lookbook-carousel"}>
                    {categoryItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.12 }}
                        whileHover={{ y: -6, transition: { duration: 0.25 } }}
                        className="lookbook-card group hover-lift"
                      >
                        <Link href={`/lookbook/${item.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", gap: "16px", height: "100%" }}>
                          <div style={{ aspectRatio: itemRatio === "auto" ? undefined : itemRatio, overflow: "hidden", backgroundColor: "var(--color-surface-container)", position: "relative" }}>
                            {item.images && item.images[0] && (
                              isVideo(item.images[0]) ? (
                                <video src={item.images[0]} style={{ width: "100%", height: "100%", objectFit: itemRatio === "auto" ? "contain" : "cover", transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }} className="hover-zoom" autoPlay muted loop playsInline />
                              ) : (
                                <Image src={item.images[0]} alt={item.name} fill style={{ objectFit: itemRatio === "auto" ? "contain" : "cover", transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }} className="hover-zoom" quality={90} />
                              )
                            )}
                            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.2)", opacity: 0, transition: "opacity 0.5s ease" }} className="hover-overlay"></div>
                          </div>
                          <div>
                            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>{item.name}</h3>
                            <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.description}</p>
                            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-primary)", marginTop: "12px", display: "inline-block", borderBottom: "1px solid var(--color-primary)", paddingBottom: "2px" }}>VIEW OVERVIEW</span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          opacity: 0;
          animation: fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-1 { animation-delay: 0.15s; }
        .delay-2 { animation-delay: 0.3s; }
        
        .lookbook-carousel {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          padding-bottom: 24px;
          scroll-snap-type: x mandatory;
          scrollbar-width: none; /* Firefox */
        }
        .lookbook-carousel::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        
        .lookbook-grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 32px;
        }

        .lookbook-card {
          flex: 0 0 320px;
          scroll-snap-align: start;
        }

        .lookbook-card .hover-zoom { transform: scale(1); }
        .lookbook-card:hover .hover-zoom { transform: scale(1.08); }
        .lookbook-card:hover .hover-overlay { opacity: 1; }
      `}} />
    </>
  );
}
