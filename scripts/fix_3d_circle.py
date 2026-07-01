import os

FILE_PATH = r"src\app\(storefront)\lookbook\page.tsx"

def main():
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    new_slider_code = """function Faux3DSlider({ images }: { images: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const autoPlayTween = useRef<gsap.core.Tween | null>(null);

  const cardWidth = 280;
  const radius = useMemo(() => {
    return Math.round((cardWidth / 2) / Math.tan(Math.PI / Math.max(images.length, 1))) + 80;
  }, [images.length]);

  useGSAP(() => {
    if (!containerRef.current || images.length === 0) return;

    // Start infinite autoplay
    const startAutoPlay = () => {
      autoPlayTween.current = gsap.to(rotationRef, {
        current: "-=360",
        duration: 40,
        ease: "none",
        repeat: -1,
        onUpdate: () => {
          gsap.set(containerRef.current, { rotationY: rotationRef.current });
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
    lastX.current = e.clientX;
    if (autoPlayTween.current) autoPlayTween.current.pause();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const deltaX = e.clientX - lastX.current;
    lastX.current = e.clientX;
    rotationRef.current += deltaX * 0.5; // adjust sensitivity
    gsap.set(containerRef.current, { rotationY: rotationRef.current });
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
}"""
    
    start_index = content.find("function Faux3DSlider({ images }")
    end_index = content.find("export default function LookbookPage()")
    
    if start_index != -1 and end_index != -1:
        content = content[:start_index] + new_slider_code + "\n\n" + content[end_index:]
        with open(FILE_PATH, "w", encoding="utf-8") as f:
            f.write(content)
        print("Updated 360 circle math successfully!")
    else:
        print("Could not find boundaries")

if __name__ == "__main__":
    main()
