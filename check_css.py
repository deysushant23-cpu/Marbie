
import re

with open(r"c:\Users\Sushant\Marbie_Bridal\homepage_stitch_2.html", "r", encoding="utf-8") as f:
    content = f.read()

style_match = re.search(r"<style>(.*?)</style>", content, flags=re.DOTALL)
if style_match:
    css = style_match.group(1)
    open_braces = css.count("{")
    close_braces = css.count("}")
    print(f"CSS braces: open={open_braces}, close={close_braces}")
else:
    print("No style tag")
