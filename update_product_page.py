
import re

file_path = r"c:\Users\Sushant\Marbie_Bridal\src\app\(storefront)\product\[id]\page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add config state
content = content.replace(
    "const [product, setProduct] = useState<any>(null);",
    "const [product, setProduct] = useState<any>(null);\n  const [config, setConfig] = useState<any>(null);"
)

# Add fetch config inside useEffect
content = content.replace(
    """fetch(`/api/products/${id}`)""",
    """fetch("/api/config").then(res => res.json()).then(data => setConfig(data)).catch(err => console.error(err));\n    fetch(`/api/products/${id}`)"""
)

# Replace "Preparing Masterpiece..."
content = content.replace(
    """<p style={{ letterSpacing: "0.15em", textTransform: "uppercase", fontSize: "14px" }}>Preparing Masterpiece...</p>""",
    """<p style={{ letterSpacing: "0.15em", textTransform: "uppercase", fontSize: "14px" }}>{config?.labels?.productDetail?.loadingText || "Preparing Masterpiece..."}</p>"""
)

# Replace fallback description
content = content.replace(
    """{product.description || "An exquisite piece crafted with unparalleled attention to detail. Designed for the modern aesthete who appreciates heritage craftsmanship and timeless elegance."}""",
    """{product.description || config?.labels?.productDetail?.fallbackDesc || "An exquisite piece crafted with unparalleled attention to detail."}"""
)

# Replace ADD TO BAG
content = content.replace(
    """ADD TO BAG""",
    """{config?.labels?.productDetail?.addToBag || "ADD TO BAG"}"""
)

# Replace Value Propositions
content = content.replace(
    """          {/* Value Propositions */}
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: "40px", paddingTop: "32px", borderTop: "1px solid var(--color-outline-variant)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "var(--color-on-surface-variant)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>local_shipping</span>
              <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Free Shipping</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "var(--color-on-surface-variant)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>autorenew</span>
              <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>7-Day Returns</span>
            </div>
          </div>""",
    """          {/* Value Propositions */}
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: "40px", paddingTop: "32px", borderTop: "1px solid var(--color-outline-variant)" }}>
            {(config?.labels?.productDetail?.valueProps || [
              { icon: "local_shipping", text: "Free Shipping" },
              { icon: "autorenew", text: "7-Day Returns" }
            ]).map((prop: any, index: number) => (
              <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "var(--color-on-surface-variant)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>{prop.icon}</span>
                <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{prop.text}</span>
              </div>
            ))}
          </div>"""
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated product page.")
