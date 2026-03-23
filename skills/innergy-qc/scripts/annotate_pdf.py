#!/usr/bin/env python3
"""
annotate_pdf.py
Creates OCG-layered annotated PDFs from source drawings.
OCG layers can be toggled in FoxIt PDF Reader (F5 → Layers tab).
"""

import argparse
import fitz

BLUE   = (0.10, 0.36, 0.73)
WHITE  = (1.0,  1.0,  1.0)
RED    = (0.90, 0.10, 0.10)
GREEN  = (0.13, 0.55, 0.13)
ORANGE = (0.85, 0.45, 0.00)
HEADER_H = 36
FONT_ANN = 16


def make_ocg(doc, name):
    return doc.add_ocg(name, on=False)


def add_rect(page, rect, stroke=BLUE, fill=None, width=2, dashes=None, ocg=None):
    a = page.add_rect_annot(rect)
    a.set_colors(stroke=stroke)
    if fill:
        a.set_colors(stroke=stroke, fill=fill)
    a.set_border(width=width, dashes=dashes or [])
    if ocg:
        a.set_oc(ocg)
    a.update()


def add_freetext(page, rect, text, fontsize, text_color, fill_color,
                  fontname="helv", align=0, ocg=None):
    a = page.add_freetext_annot(rect, text, fontsize=fontsize,
                                text_color=text_color, fill_color=fill_color,
                                fontname=fontname, align=align)
    if ocg:
        a.set_oc(ocg)
    a.update()


def add_header(page, box, title, ocg):
    hdr_rect = fitz.Rect(box.x0, box.y0, box.x1, box.y0 + HEADER_H)
    add_rect(page, hdr_rect, stroke=BLUE, fill=BLUE, width=0, ocg=ocg)
    add_freetext(page,
                 fitz.Rect(box.x0 + 10, box.y0 + 6, box.x1 - 10, box.y0 + HEADER_H),
                 title, FONT_ANN, WHITE, WHITE, align=1, ocg=ocg)


def add_body_box(page, box, lines, header_h=HEADER_H, ocg=None):
    body_rect = fitz.Rect(box.x0, box.y0 + header_h, box.x1, box.y1)
    add_rect(page, body_rect, stroke=BLUE, fill=WHITE, width=2, ocg=ocg)
    body_text_rect = fitz.Rect(
        box.x0 + 12, box.y0 + header_h + 8,
        box.x1 - 12, box.y1 - 8
    )
    add_freetext(page, body_text_rect, "\n".join(lines),
                 FONT_ANN - 2, BLUE, WHITE, ocg=ocg)


def add_lasso(page, rect, pad=20, ocg=None):
    lr = fitz.Rect(rect.x0 - pad, rect.y0 - pad, rect.x1 + pad, rect.y1 + pad)
    add_rect(page, lr, stroke=RED, width=3, dashes=[8, 5], ocg=ocg)
    sz = 28
    for (a, b) in [
        (fitz.Point(lr.x0, lr.y0), fitz.Point(lr.x0, lr.y0 + sz)),
        (fitz.Point(lr.x0, lr.y0), fitz.Point(lr.x0 + sz, lr.y0)),
        (fitz.Point(lr.x1 - sz, lr.y0), fitz.Point(lr.x1, lr.y0 + sz)),
        (fitz.Point(lr.x1, lr.y0 - sz + sz), fitz.Point(lr.x1, lr.y0)),
        (fitz.Point(lr.x0, lr.y1 - sz), fitz.Point(lr.x0 + sz, lr.y1)),
        (fitz.Point(lr.x0, lr.y1), fitz.Point(lr.x0, lr.y1)),
    ]:
        la = page.add_line_annot(a, b)
        la.set_colors(stroke=RED)
        la.set_border(width=3)
        if ocg:
            la.set_oc(ocg)
        la.update()
    label_rect = fitz.Rect(lr.x0, lr.y1 + 6, lr.x0 + 320, lr.y1 + 44)
    add_freetext(page, label_rect, "DISCREPANCY AREA",
                 FONT_ANN, RED, WHITE, ocg=ocg)


def create_annotated_page(doc, src_doc, src_page_idx, page_label,
                           title, comment_lines, lasso_rect=None, comment_box=None):
    sp = src_doc[src_page_idx]
    w, h = float(sp.rect.width), float(sp.rect.height)
    page = doc.new_page(width=w, height=h)
    page.show_pdf_page(fitz.Rect(0, 0, w, h), src_doc, src_page_idx)

    ocg_lasso = make_ocg(doc, f"Lasso {page_label}")
    ocg_cmnt  = make_ocg(doc, f"Comments {page_label}")

    if lasso_rect:
        add_lasso(page, lasso_rect, ocg=ocg_lasso)
    if comment_box:
        add_header(page, comment_box, title, ocg_cmnt)
        add_body_box(page, comment_box, comment_lines, ocg=ocg_cmnt)

    return page


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--pages", required=True, help="Comma-separated 0-indexed page numbers")
    parser.add_argument("--discrepancy", required=True)
    parser.add_argument("--lasso", required=True, help="x1,y1,x2,y2")
    parser.add_argument("--title", default="QC Annotation")
    args = parser.parse_args()

    pages = [int(p.strip()) for p in args.pages.split(",")]
    x1, y1, x2, y2 = [float(x) for x in args.lasso.split(",")]
    lasso = fitz.Rect(x1, y1, x2, y2)

    src = fitz.open(args.input)
    doc = fitz.open()
    doc.set_metadata({
        "title": f"QC Annotation - {args.discrepancy}",
        "creator": "OpenClaw CatDogBot",
    })

    for i, pg_idx in enumerate(pages):
        create_annotated_page(
            doc, src, pg_idx,
            page_label=f"p{i}",
            title=args.title if i == 0 else f"{args.title} (cont.)",
            comment_lines=args.discrepancy.split("|"),
            lasso_rect=lasso,
            comment_box=fitz.Rect(100, 100, 1000, 600),
        )

    doc.save(args.output, garbage=4, deflate=True, clean=True)
    doc.close()
    src.close()
    print(f"Saved: {args.output}")
