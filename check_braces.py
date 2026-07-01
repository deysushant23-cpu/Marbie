
import re

with open(r"c:\Users\Sushant\Marbie_Bridal\homepage_stitch_2.html", "r", encoding="utf-8") as f:
    content = f.read()

style_match = re.search(r"<style>(.*?)</style>", content, flags=re.DOTALL)
if style_match:
    css = style_match.group(1)
    
    open_count = 0
    close_count = 0
    lines = css.split("\n")
    for i, line in enumerate(lines):
        open_count += line.count("{")
        close_count += line.count("}")
        if close_count > open_count:
            print(f"Mismatch at line {i+11}: open={open_count}, close={close_count}")
            print(line)
            break
else:
    print("No style tag")
