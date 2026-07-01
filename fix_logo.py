
import re

css_addition = """
/* Mobile Logo Fixes */
@media (max-width: 768px) {
    .logo {
        font-size: 32px;
    }
    .nav-inner .logo {
        margin-left: 0;
    }
}
"""

with open(r"c:\Users\Sushant\Marbie_Bridal\src\app\globals.css", "a", encoding="utf-8") as f:
    f.write("\n" + css_addition)

print("Fixed logo styling on mobile")
