
from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []

    def handle_starttag(self, tag, attrs):
        if tag not in ["img", "input", "br", "hr", "meta", "link", "source"]:
            self.stack.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if not self.stack:
            print(f"Extra closing tag </{tag}> at line {self.getpos()[0]}")
            return
        expected, pos = self.stack.pop()
        if expected != tag:
            print(f"Mismatched tag: expected </{expected}> from line {pos[0]}, got </{tag}> at line {self.getpos()[0]}")

parser = MyHTMLParser()
with open(r"c:\Users\Sushant\Marbie_Bridal\homepage_stitch_2.html", "r", encoding="utf-8") as f:
    parser.feed(f.read())
if parser.stack:
    print(f"Unclosed tags remaining: {[(tag, pos[0]) for tag, pos in parser.stack]}")
else:
    print("All tags matched perfectly!")
