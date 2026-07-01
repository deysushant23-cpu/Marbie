
import re

with open(r"c:\Users\Sushant\Marbie_Bridal\homepage_stitch_2.html", "r", encoding="utf-8") as f:
    content = f.read()

# Revert my previous changes to HTML
content = content.replace('<button class="icon-btn lg-hidden" style="display: none;" id="mobile-menu-trigger">', '<button class="icon-btn lg-hidden" style="display: none;">')
content = re.sub(r'// Mobile Menu Logic.*?(?=</script>)', '', content, flags=re.DOTALL)

style_match = re.search(r'(<style>)(.*?)(</style>)', content, flags=re.DOTALL)
if not style_match:
    print("Style tag not found")
    exit()

css = style_match.group(2)

# Remove my Mobile Responsiveness addition
css = re.sub(r'/\* Mobile Responsiveness \*/.*', '', css, flags=re.DOTALL)

# Inline the desktop media queries and remove mobile-first rules
css = css.replace('padding: 0 var(--margin-mobile);', 'padding: 0 var(--margin-desktop);')
css = re.sub(r'@media \(min-width: 768px\) \{\s*\.container \{[^}]*\}\s*\}', '', css)

css = css.replace('display: none; align-items: center; gap: 8px;', 'display: flex; align-items: center; gap: 8px;')
css = css.replace('@media (min-width: 640px) { .search-bar { display: flex; } }', '')

css = re.sub(r'@media \(max-width: 767px\) \{[^}]*\}', '', css)

css = css.replace('text-align: center; }', 'text-align: left; }') # hero-text-box
css = css.replace('@media (min-width: 768px) { .hero-text-box { text-align: left; } }', '')

css = css.replace('font-size: 32px; \n            line-height: 1.2; \n            font-weight: 600;', 'font-size: 64px; line-height: 1.1; font-weight: 700; letter-spacing: -0.02em;')
css = css.replace('@media (min-width: 768px) { .hero-title { font-size: 64px; line-height: 1.1; font-weight: 700; letter-spacing: -0.02em; } }', '')

css = css.replace('margin-left: auto; \n            margin-right: auto;', 'margin-left: 0; margin-right: 0;')
css = css.replace('@media (min-width: 768px) { .hero-description { margin-left: 0; margin-right: 0; } }', '')

css = css.replace('flex-direction: column; gap: 16px; justify-content: center;', 'flex-direction: row; gap: 16px; justify-content: flex-start;')
css = css.replace('@media (min-width: 640px) { .hero-buttons { flex-direction: row; } }', '')
css = css.replace('@media (min-width: 768px) { .hero-buttons { justify-content: flex-start; } }', '')

css = css.replace('.category-grid { display: grid; grid-template-columns: 1fr; gap: var(--gutter); }', '.category-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--gutter); }')
css = css.replace('@media (min-width: 768px) { .category-grid { grid-template-columns: repeat(3, 1fr); } }', '')

css = css.replace('.category-card:nth-child(2) { transform: translateY(48px); }', '')
css = css.replace('@media (min-width: 768px) { .category-card:nth-child(2) { transform: translateY(48px); } }', '.category-card:nth-child(2) { transform: translateY(48px); }')

css = css.replace('flex-direction: column; gap: 24px; margin-bottom: 64px;', 'flex-direction: row; justify-content: space-between; align-items: flex-end; margin-bottom: 64px;')
css = css.replace('@media (min-width: 768px) { .arrivals-header { flex-direction: row; justify-content: space-between; align-items: flex-end; } }', '')

css = css.replace('.products-grid { display: grid; grid-template-columns: 1fr; gap: var(--gutter); }', '.products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--gutter); }')
css = css.replace('@media (min-width: 640px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }', '')
css = css.replace('@media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }', '')

css = css.replace('.promise-inner { display: grid; grid-template-columns: 1fr; gap: 64px; align-items: center; }', '.promise-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }')
css = css.replace('@media (min-width: 768px) { .promise-inner { grid-template-columns: 1fr 1fr; } }', '')

css = css.replace('.insta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }', '.insta-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }')
css = css.replace('@media (min-width: 768px) { .insta-grid { grid-template-columns: repeat(4, 1fr); } }', '')
css = css.replace('@media (min-width: 1024px) { .insta-grid { grid-template-columns: repeat(6, 1fr); } }', '')

css = css.replace('.footer-main { display: flex; flex-direction: column; gap: 48px; padding: 64px 0; }', '.footer-main { display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; gap: 48px; padding: 64px 0; }')
css = css.replace('@media (min-width: 768px) { .footer-main { flex-direction: row; justify-content: space-between; align-items: flex-start; } }', '')

css = css.replace('.footer-newsletter { width: 100%; }', '.footer-newsletter { width: auto; }')
css = css.replace('@media (min-width: 768px) { .footer-newsletter { width: auto; } }', '')

css = css.replace('.footer-bottom { border-top: 1px solid rgba(113, 121, 117, 0.1); padding: 32px 0; text-align: center; }', '.footer-bottom { border-top: 1px solid rgba(113, 121, 117, 0.1); padding: 32px 0; text-align: left; }')
css = css.replace('@media (min-width: 768px) { .footer-bottom { text-align: left; } }', '')

# Function to replace px with clamp
def px_to_clamp(match):
    val = float(match.group(1))
    if val == 0: return "0"
    if val == 1: return "1px"  # dont scale 1px borders
    
    # Calculate scaled values
    min_val = round(val / 4.0, 2)
    vw_val = round(val / 12.8, 4)
    return f"clamp({min_val}px, {vw_val}vw, {val}px)"

# Replace all Xpx with clamp, except in media queries (which should be mostly gone)
# We will use regex to find \b(\d+)px\b
# But wait! We need to avoid scaling things inside the base64 SVG/PNG strings.
# Base64 strings don't usually have "px", they have other things. 
# Also avoid scaling inside translate(48px) if possible, but actually we DO want to scale translateY(48px) !
# What about "width: 1280px"? That's container max.
# We will replace container-max with 100% instead.
css = css.replace('--container-max: 1280px;', '--container-max: 100%;')

css = re.sub(r'\b(\d+(?:\.\d+)?)px\b', px_to_clamp, css)

content = content[:style_match.start(2)] + css + content[style_match.end(2):]

with open(r"c:\Users\Sushant\Marbie_Bridal\homepage_stitch_2.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
