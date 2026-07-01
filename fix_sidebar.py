
import re

file_path = r"c:\Users\Sushant\Marbie_Bridal\src\app\globals.css"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = """.catalog-sidebar {
    width: 100%;
}

@media (min-width: 1024px) {
    .catalog-sidebar {
        width: 280px;
        flex-shrink: 0;
    }"""

replacement = """.catalog-sidebar {
    display: none; /* Hide desktop sidebar on mobile */
    width: 100%;
}

@media (min-width: 1024px) {
    .catalog-sidebar {
        display: block; /* Show on desktop */
        width: 280px;
        flex-shrink: 0;
    }"""

content = content.replace(target, replacement)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed catalog sidebar visibility.")
