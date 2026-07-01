"use client";

import React, { useState, useEffect, Suspense, use } from "react";
import Link from "next/link";
import { isVideo } from "@/lib/media";
import { motion } from "framer-motion";
import Image from "next/image";

export default function LookbookOverview({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div style={{ padding: "120px 24px", textAlign: "center" }}>Loading Lookbook Overview...</div>}>
      <LookbookDetails params={params} />
    </Suspense>
  );
}

function LookbookDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lookbook/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setItem(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) return <div style={{ padding: "120px 24px", textAlign: "center" }}>Loading Lookbook Overview...</div>;
  if (!item) return <div style={{ padding: "120px 24px", textAlign: "center" }}>Lookbook item not found.</div>;

  const validImages = item.images?.filter((img: string) => img && img.trim() !== "") || [];

  return (
    <>
      <div style={{ backgroundColor: "var(--color-surface)", padding: "120px 24px 64px 24px", textAlign: "center" }}>
        <nav className="animate-slide-in" style={{ fontSize: "11px", fontWeight: "700", marginBottom: "24px", display: "flex", justifyContent: "center", gap: "8px" }}>
          <Link href="/lookbook" style={{ color: "var(--color-on-surface-variant)", textDecoration: "none" }}>LOOKBOOK</Link>
          <span>/</span>
          <span style={{ color: "var(--color-primary)" }}>{item.category?.toUpperCase()}</span>
        </nav>
        <h1 className="animate-slide-in delay-1" style={{ fontFamily: "var(--font-display)", fontSize: "48px", marginBottom: "24px", color: "var(--color-on-surface)", lineHeight: 1.1 }}>
          {item.name}
        </h1>
        <p className="animate-slide-in delay-2" style={{ maxWidth: "600px", margin: "0 auto", fontSize: "16px", color: "var(--color-on-surface-variant)", lineHeight: 1.6 }}>
          {item.description}
        </p>
      </div>

      <div className="container" style={{ padding: "0 24px 120px 24px" }}>
        {validImages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px", backgroundColor: "var(--color-surface-container)" }}>
            No images available for this lookbook.
          </div>
        ) : (
          <div className="lookbook-grid">
            {validImages.map((img: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                className={`lookbook-grid-item item-${index} hover-lift`}
              >
                <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
                  {isVideo(img) ? (
                    <video src={img} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }} className="hover-zoom" autoPlay muted loop playsInline />
                  ) : (
                    <Image src={img} alt={`${item.name} - View ${index + 1}`} fill style={{ objectFit: "cover", transition: "transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }} className="hover-zoom" quality={90} />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .lookbook-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .lookbook-grid-item {
          aspect-ratio: 4/5;
          background-color: var(--color-surface-container);
        }
        @media (min-width: 768px) {
          .lookbook-grid {
            grid-template-columns: 1fr 1fr;
            grid-auto-rows: minmax(400px, 600px);
            gap: 24px;
          }
          .lookbook-grid-item.item-0 {
            grid-column: 1 / -1;
            aspect-ratio: 21/9;
          }
          .lookbook-grid-item.item-1, .lookbook-grid-item.item-2 {
            aspect-ratio: auto;
          }
          .lookbook-grid-item.item-3 {
            grid-column: 1 / -1;
            aspect-ratio: 16/9;
          }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(80px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in {
          opacity: 0;
          animation: slideInRight 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        
        .lookbook-grid-item .hover-zoom { transform: scale(1); }
        .lookbook-grid-item:hover .hover-zoom { transform: scale(1.05); }
      `}} />
    </>
  );
}
