#!/usr/bin/env python3
"""
identify_coords.py
Renders a PDF page as a PNG image so you can find lasso coordinates
for annotate_pdf.py.

Open the PNG in any image viewer — hover over the discrepancy area and
read X,Y from the viewer's status bar. Then use those values in --lasso.

Usage:
    python3 scripts/identify_coords.py \
        --input path/to/drawings_extracted.pdf \
        --output coords_page.png \
        --page 2
"""
import argparse
import fitz

parser = argparse.ArgumentParser()
parser.add_argument("--input", required=True)
parser.add_argument("--output", required=True)
parser.add_argument("--page", type=int, default=0)
parser.add_argument("--zoom", type=float, default=1.5, help="Render zoom (default 1.5x)")
args = parser.parse_args()

doc = fitz.open(args.input)
page = doc[args.page]
mat = fitz.Matrix(args.zoom, args.zoom)
pix = page.get_pixmap(matrix=mat)
pix.save(args.output)
print(f"Page {args.page}: {pix.width}x{pix.height} px saved to {args.output}")
print(f"Open in an image viewer — hover over the discrepancy area and note X,Y from the status bar.")
print(f"Then use those values in annotate_pdf.py --lasso as x1,y1,x2,y2")
doc.close()
