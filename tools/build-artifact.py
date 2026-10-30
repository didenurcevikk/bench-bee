"""Builds a single-file copy of Bench Bee (styles, data and code inlined) for the hosted claude.ai preview.
Usage: python3 tools/build-artifact.py OUTPUT.html"""
import re, sys, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text()
body = re.search(r"<body>\n(.*?)\n<script src=", html, re.S).group(1)
fonts = re.findall(r'<link rel="(?:preconnect|stylesheet)" href="https://fonts[^>]*>', html)
css = (root / "styles.css").read_text()
js = (root / "data/western-blot.js").read_text() + "\n" + (root / "app.js").read_text() + "\n" + (root / "photo.js").read_text()

out = "\n".join([
    "<title>Bench Bee</title>",
    '<meta name="claude:viewport-fit-sides" content="cover">',
    *fonts,
    "<style>\n" + css + "\n</style>",
    body,
    "<script>\nwindow.BB_EMBED = true;\n" + js + "\n</script>",
])
pathlib.Path(sys.argv[1]).write_text(out)
print("built", sys.argv[1])
