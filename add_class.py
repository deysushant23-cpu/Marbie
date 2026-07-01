
import re

css_addition = """
/* Product Detail Layout */
.product-detail-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: start;
}

@media (max-width: 768px) {
    .product-detail-layout {
        grid-template-columns: 1fr;
        gap: 32px;
    }
}
"""

with open(r"c:\Users\Sushant\Marbie_Bridal\src\app\globals.css", "a", encoding="utf-8") as f:
    f.write("\n" + css_addition)

with open(r"c:\Users\Sushant\Marbie_Bridal\src\app\(storefront)\product\[id]\page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "<div style={{ display: \"grid\", gridTemplateColumns: \"1fr 1fr\", gap: \"64px\", alignItems: \"start\" }}>",
    "<div className=\"product-detail-layout\">"
)

with open(r"c:\Users\Sushant\Marbie_Bridal\src\app\(storefront)\product\[id]\page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Added product-detail-layout class and updated page.tsx")
