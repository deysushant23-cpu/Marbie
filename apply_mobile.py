
import re

with open(r"c:\Users\Sushant\Marbie_Bridal\homepage_stitch_2.html", "r", encoding="utf-8") as f:
    content = f.read()

# Remove inline display: none for the hamburger menu
content = content.replace("<button class=\"icon-btn lg-hidden\" style=\"display: none;\">", "<button class=\"icon-btn lg-hidden\">")

media_query = """
        /* Standard Mobile Responsive Adjustments */
        @media (max-width: 1023px) {
            .nav-links { display: none !important; }
            .lg-hidden { display: inline-flex !important; }
        }
        @media (max-width: 768px) {
            .container { padding: 0 16px; }
            .hero-title { font-size: 40px; }
            .hero-text-box { text-align: center; max-width: 100%; margin: 0 auto; }
            .hero-content { display: flex; flex-direction: column; align-items: center; }
            
            .category-grid { grid-template-columns: repeat(1, 1fr); gap: 16px; }
            .products-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
            .promise-inner { grid-template-columns: 1fr; gap: 32px; }
            .insta-grid { grid-template-columns: repeat(3, 1fr); }
            
            .footer-main { flex-direction: column; gap: 32px; }
            .footer-nav { grid-template-columns: 1fr; gap: 32px; }
            
            .arrivals-header { flex-direction: column; align-items: flex-start; gap: 16px; }
        }
        @media (min-width: 1024px) {
            .lg-hidden { display: none !important; }
        }
"""

# Insert media query before </style>
content = content.replace("</style>", media_query + "\n        </style>")

with open(r"c:\Users\Sushant\Marbie_Bridal\homepage_stitch_2.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Applied standard mobile responsiveness.")
