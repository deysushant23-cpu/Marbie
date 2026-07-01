import os

FILE_PATH = r"src\app\(storefront)\lookbook\page.tsx"

def main():
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    new_slider_code = """function Faux3DSlider({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4500);
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
      if (offset > Math.floor(images.length / 2)) offset -= images.length;
      if (offset < -Math.floor(images.length / 2)) offset += images.length;

      const isCenter = offset === 0;
      const absOffset = Math.abs(offset);
      
      const xPercent = offset * 55;
      const scale = isCenter ? 1 : Math.max(0.75, 1 - absOffset * 0.08);
      const zIndex = 100 - absOffset;
      const opacity = absOffset > 3 ? 0 : isCenter ? 1 : Math.max(0.3, 0.9 - absOffset * 0.2);
      const rotateY = -offset * 20;

      gsap.to(card, {
        xPercent,
        scale,
        zIndex,
        opacity,
        rotateY,
        duration: 0.9,
        ease: "power2.out",
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
      dragStartX.current = e.clientX;
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
      style={{ padding: "80px 0", perspective: "1500px", overflow: "hidden", userSelect: "none", touchAction: "pan-y", backgroundColor: "#000", color: "#fff" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="container" style={{ textAlign: "center", marginBottom: "56px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "32px", color: "#fed65b", letterSpacing: "0.3em", textTransform: "uppercase" }}>CINEMATIC HIGHLIGHTS</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", marginTop: "12px", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Drag or swipe to explore the collection</p>
      </div>
      <div 
        ref={containerRef} 
        style={{ position: "relative", height: "65vh", minHeight: "500px", display: "flex", justifyContent: "center", alignItems: "center", transformStyle: "preserve-3d" }}
      >
        {images.map((img, i) => (
          <div 
            key={i} 
            className="slider-card"
            style={{ position: "absolute", width: "85%", maxWidth: "900px", height: "100%", borderRadius: "16px", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.6)", cursor: isDragging ? "grabbing" : "grab", transformOrigin: "center center" }}
            onClick={() => setActiveIndex(i)}
          >
            {isVideo(img) ? (
              <video src={img} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Image src={img} alt={`Slide ${i}`} fill style={{ objectFit: "cover", pointerEvents: "none" }} quality={100} />
            )}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)" }}></div>
          </div>
        ))}
      </div>
      
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "48px" }}>
        {images.map((_, i) => (
          <button 
            key={i}
            onClick={() => setActiveIndex(i)}
            style={{ width: i === activeIndex ? "36px" : "10px", height: "10px", borderRadius: "10px", backgroundColor: i === activeIndex ? "#fed65b" : "rgba(255,255,255,0.3)", border: "none", transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)", cursor: "pointer", padding: 0 }}
            aria-label={`Go to slide ${i+1}`}
          />
        ))}
      </div>
    </div>
  );
}"""
    
    # We will slice and replace the function entirely
    start_index = content.find("function Faux3DSlider({ images }")
    end_index = content.find("export default function LookbookPage()")
    
    if start_index != -1 and end_index != -1:
        content = content[:start_index] + new_slider_code + "\n\n" + content[end_index:]
        with open(FILE_PATH, "w", encoding="utf-8") as f:
            f.write(content)
        print("Updated cinematic math successfully!")
    else:
        print("Could not find boundaries")

if __name__ == "__main__":
    main()
