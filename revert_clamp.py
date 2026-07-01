
import re

with open(r"c:\Users\Sushant\Marbie_Bridal\homepage_stitch_2.html", "r", encoding="utf-8") as f:
    content = f.read()

def revert_clamp(match):
    return match.group(1)

content = re.sub(r"clamp\([0-9.]+px,\s*[0-9.]+vw,\s*([0-9.]+(?:px|%|vw|vh))\)", revert_clamp, content)

# Special case for --container-max if it was changed
content = content.replace("--container-max: 100%;", "--container-max: 1280px;")

with open(r"c:\Users\Sushant\Marbie_Bridal\homepage_stitch_2.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Reverted clamps to max values.")
