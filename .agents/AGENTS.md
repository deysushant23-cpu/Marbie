# Storefront Responsive & Animation Rules

**CRITICAL RULES FOR ALL FUTURE CHANGES:**

1. **Fully Dynamic & Adaptable:** 
   Everything must be dynamically resized to adapt to both mobile (phone view) and desktop views. DO NOT use hardcoded heights, widths, or fixed pixel sizes (`px`) for layout containers that break responsiveness. Always use fluid units (`%`, `vh`, `vw`, `clamp()`, `aspect-ratio`) and proper media queries.

2. **No Animation Pausing or Removal:**
   DO NOT change, remove, or pause any existing animations. This includes button motions, hover lifts, filters, image scroll effects, and hero slideshow transitions.

3. **Media Protection:**
   The phone view must NEVER aggressively cut or crop images used for banners. Use `aspect-ratio` or `object-fit` strategies that preserve the main content of the image.

4. **Phone Usability:**
   Phone views must not have massive text. Always scale typography down for mobile so users can interact with the website easily without excessive scrolling or broken layouts.
