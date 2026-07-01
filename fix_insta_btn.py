
import re

css_addition = """
/* Instagram Shop Button */
.insta-shop-btn {
    position: absolute;
    bottom: 16px;
    left: 16px;
    right: 16px;
    background-color: var(--color-surface);
    color: var(--color-primary);
    padding: 10px 16px;
    border-radius: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-weight: 500;
    font-size: 14px;
    opacity: 0.9;
    pointer-events: none;
    white-space: nowrap;
}

@media (max-width: 768px) {
    .insta-shop-btn {
        bottom: 8px;
        left: 8px;
        right: 8px;
        padding: 6px 8px;
        font-size: 12px;
        gap: 4px;
    }
    .insta-shop-btn .material-symbols-outlined {
        font-size: 14px !important;
    }
}
"""

with open(r"c:\Users\Sushant\Marbie_Bridal\src\app\globals.css", "a", encoding="utf-8") as f:
    f.write("\n" + css_addition)

file_path = r"c:\Users\Sushant\Marbie_Bridal\src\app\(storefront)\page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = """                      <motion.div 
                        style={{
                          position: "absolute", bottom: "16px", left: "16px", right: "16px",
                          backgroundColor: "var(--color-surface)", color: "var(--color-primary)",
                          padding: "10px 16px", borderRadius: "100px", display: "flex", 
                          alignItems: "center", justifyContent: "center", gap: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          fontWeight: "500", fontSize: "14px",
                          opacity: 0.9,
                          pointerEvents: "none"
                        }}
                        variants={{ hover: { opacity: 1, scale: 1.05 } }}"""

replacement = """                      <motion.div 
                        className="insta-shop-btn"
                        variants={{ hover: { opacity: 1, scale: 1.05 } }}"""

content = content.replace(target, replacement)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed Instagram shop button.")
