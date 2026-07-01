import os
import re

def main():
    filepath = r"c:\Users\Sushant\Marbie\src\app\(storefront)\page.tsx"
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 1. Add GSAP imports
    imports = """import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
"""
    content = content.replace('import { motion, AnimatePresence } from "framer-motion";', imports + 'import { motion, AnimatePresence } from "framer-motion";')
    
    # 2. Add MagneticButton Component
    magnetic_button = """
gsap.registerPlugin(ScrollTrigger);

const MagneticButton = ({ children, href, className, style, onClick }: any) => {
  const magneticRef = React.useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = magneticRef.current;
    if(!el) return;
    const xTo = gsap.quickTo(el, "x", {duration: 1, ease: "elastic.out(1, 0.3)"});
    const yTo = gsap.quickTo(el, "y", {duration: 1, ease: "elastic.out(1, 0.3)"});
    
    const mouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = el.getBoundingClientRect();
      const x = clientX - (left + width/2);
      const y = clientY - (top + height/2);
      xTo(x * 0.35);
      yTo(y * 0.35);
    };
    const mouseLeave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("mousemove", mouseMove);
    el.addEventListener("mouseleave", mouseLeave);
    return () => {
      el.removeEventListener("mousemove", mouseMove);
      el.removeEventListener("mouseleave", mouseLeave);
    };
  }, { scope: magneticRef });

  if(href) {
    return <Link ref={magneticRef} href={href} className={className} style={{...style, display: "inline-block"}} onClick={onClick}>{children}</Link>;
  }
  return <button ref={magneticRef} className={className} style={{...style, display: "inline-block", border: "none"}} onClick={onClick}>{children}</button>;
};
"""
    content = content.replace("const DEFAULT_HERO_IMAGE", magnetic_button + "\nconst DEFAULT_HERO_IMAGE")
    
    # 3. Add useGSAP inside Home()
    home_start = """export default function Home() {
  const mainRef = React.useRef<HTMLDivElement>(null);
  const trousseauRef = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Scroll Reveals
    const revealElements = gsap.utils.toArray('.gsap-reveal');
    revealElements.forEach((el: any) => {
      gsap.fromTo(el, 
        { opacity: 0, y: 50 }, 
        { 
          opacity: 1, y: 0, 
          duration: 1, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Parallax Hero
    gsap.to(".hero-bg-parallax", {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    // Staggered Hero Text
    gsap.fromTo(".hero-stagger", 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power4.out", delay: 0.5 }
    );
    
  }, { scope: mainRef });
  
  // Trousseau crossfade logic
  const handleTrousseauChange = (idx: number) => {
    if (idx === activeOccasion) return;
    const tl = gsap.timeline();
    tl.to(".trousseau-content", { opacity: 0, scale: 0.98, duration: 0.3, ease: "power2.inOut" })
      .call(() => setActiveOccasion(idx))
      .to(".trousseau-content", { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
  };
"""
    content = content.replace("export default function Home() {", home_start)
    
    # 4. Wrap <main> with <main ref={mainRef}>
    content = content.replace("<main>", "<main ref={mainRef}>")
    
    # 5. Modify Hero buttons to use MagneticButton
    content = content.replace('<Link href={config.labels?.heroButtons?.primaryLink || "/necklaces"} className="btn-hero-primary hover-scale" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>', '<MagneticButton href={config.labels?.heroButtons?.primaryLink || "/necklaces"} className="btn-hero-primary hero-stagger">')
    content = content.replace('</Link>\n              <Link href={config.labels?.heroButtons?.secondaryLink || "/lookbook"} className="btn-hero-secondary hover-scale" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>', '</MagneticButton>\n              <MagneticButton href={config.labels?.heroButtons?.secondaryLink || "/lookbook"} className="btn-hero-secondary hero-stagger">')
    content = content.replace('</Link>\n            </div>', '</MagneticButton>\n            </div>')
    
    # Hero text stagger class
    content = content.replace('<span className="hero-label">', '<span className="hero-label hero-stagger">')
    content = content.replace('<h1 className="hero-title" style={{ whiteSpace: "pre-line" }}>', '<h1 className="hero-title hero-stagger" style={{ whiteSpace: "pre-line" }}>')
    content = content.replace('<p className="hero-description">', '<p className="hero-description hero-stagger">')
    
    # Hero Parallax class
    content = content.replace('<div className="hero-bg">', '<div className="hero-bg hero-bg-parallax">')
    
    # Scroll Reveal classes
    content = content.replace('<div className="section-title-wrap">', '<div className="section-title-wrap gsap-reveal">')
    content = content.replace('<div className="arrivals-header">', '<div className="arrivals-header gsap-reveal">')
    content = content.replace('<h3 className="insta-handle">', '<h3 className="insta-handle gsap-reveal">')
    
    # Collection Slider Logic
    # Update section order
    new_order = """  // Build ordered list of sections
  const sectionOrder: { key: string; order: number }[] = [
    { key: "marquee",    order: layout.orderMarquee    ?? 1 },
    { key: "hero",       order: layout.orderHero       ?? 2 },
    { key: "categories", order: layout.orderCategories ?? 3 },
    { key: "offers",     order: layout.orderOffers     ?? 4 },
    { key: "arrivals",   order: layout.orderArrivals   ?? 5 },
    { key: "trousseau",  order: layout.orderTrousseau  ?? 6 },
    { key: "instagram",  order: layout.orderInstagram  ?? 7 },
    { key: "collection", order: layout.orderCollection ?? 7.5 },
    { key: "reviews",    order: layout.orderReviews    ?? 8 },
  ].sort((a, b) => a.order - b.order);"""
    
    content = re.sub(r"// Build ordered list of sections.*?\]\.sort\(\(a, b\) => a\.order - b\.order\);", new_order, content, flags=re.DOTALL)
    
    collection_section = """
    collection: isVisible("showCollectionSlider") && (config.storefront?.collectionSlider || []).length > 0 ? (
      <section key="collection" className="section-collection gsap-reveal" style={{ padding: "64px 0", overflow: "hidden", backgroundColor: "var(--color-surface)" }}>
        <div className="container" style={{ marginBottom: "24px" }}>
          <h2 className="section-title" style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, letterSpacing: "0.2em", color: "var(--color-on-surface)", margin: 0 }}>
            {config.labels?.collectionSection?.title || "CURATED COLLECTIONS"}
          </h2>
          <p style={{ color: "var(--color-on-surface-variant)", marginTop: "8px" }}>Swipe to explore our latest lookbooks.</p>
        </div>
        <div 
          style={{ 
            display: "flex", 
            gap: "24px", 
            overflowX: "auto", 
            scrollSnapType: "x mandatory",
            padding: "0 5vw 48px 5vw",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}
          className="no-scrollbar"
        >
          {config.storefront.collectionSlider.map((img: string, i: number) => (
            <div key={i} style={{ scrollSnapAlign: "center", flexShrink: 0, width: "80vw", maxWidth: "450px", height: "600px", position: "relative", borderRadius: "16px", overflow: "hidden", boxShadow: "0 12px 36px rgba(0,36,27,0.08)" }}>
              <Image src={img} alt={`Collection Slide ${i+1}`} fill style={{ objectFit: "cover" }} quality={90} />
            </div>
          ))}
        </div>
      </section>
    ) : null,

    reviews:"""
    content = content.replace("reviews:", collection_section)
    
    # Change Trousseau Buttons to use handleTrousseauChange
    content = content.replace("onClick={() => setActiveOccasion(idx)}", "onClick={() => handleTrousseauChange(idx)}")
    
    # Modify Trousseau content wrapper with 'trousseau-content' class
    # Replace the <AnimatePresence mode="wait"> and its inner <motion.div> completely to use our GSAP one.
    
    old_trousseau_str = """          <AnimatePresence mode="wait">
            {currentOccasion && (
              <motion.div key={activeOccasion} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }} style={{ backgroundColor: "var(--color-surface)", borderRadius: "24px", border: "1px solid var(--color-outline-variant)", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,36,27,0.08)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>"""
    
    new_trousseau_str = """          <div>
            {currentOccasion && (
              <div className="trousseau-content" style={{ backgroundColor: "var(--color-surface)", borderRadius: "24px", border: "1px solid var(--color-outline-variant)", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,36,27,0.08)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>"""
              
    content = content.replace(old_trousseau_str, new_trousseau_str)
    content = content.replace("              </motion.div>\n            )}\n          </AnimatePresence>", "              </div>\n            )}\n          </div>")
    
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    main()
