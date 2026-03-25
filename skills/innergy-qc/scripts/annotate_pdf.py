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
FONT_TITLE = 32  # bold title
FONT_BODY = 24  # body text


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


def add_freetext(page, rect, text, fontsize, text_color, fill_color=None,
                  fontname="helv", align=0, ocg=None, bold=False):
    # Use bold font if requested
    if bold and fontname == "helv":
        fontname = "hebo"  # Helvetica Bold
    a = page.add_freetext_annot(rect, text, fontsize=fontsize,
                                text_color=text_color, fill_color=fill_color,
                                fontname=fontname, align=align)
    if ocg:
        a.set_oc(ocg)
    a.update()


def add_header(page, box, title, ocg):
    hdr_rect = fitz.Rect(box.x0, box.y0, box.x1, box.y0 + HEADER_H)
    # No background box — transparent text on drawing
    add_freetext(page,
                 hdr_rect,
                 title, FONT_TITLE, BLUE, None, align=1, ocg=ocg, bold=True)


def add_body_box(page, box, lines, header_h=HEADER_H, ocg=None):
    body_rect = fitz.Rect(box.x0, box.y0 + header_h, box.x1, box.y1)
    # No background rectangle — text floats transparently
    body_text_rect = fitz.Rect(
        box.x0 + 12, box.y0 + header_h + 8,
        box.x1 - 12, box.y1 - 8
    )
    add_freetext(page, body_text_rect, "\n".join(lines),
                 FONT_BODY, BLUE, None, ocg=ocg)


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
                 16, RED, None, ocg=ocg)  # lasso label: 16pt


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
    parser.add_argument("--lasso", help="x1,y1,x2,y2 (overrides --issue)")
    parser.add_argument("--title", default="QC Annotation")
    parser.add_argument("--issue", help="Auto-detect coordinates: floating_shelf, wall_cabinet_1300, base_cabinet, trash_cabinet")
    parser.add_argument("--pad", type=int, default=50, help="Padding around found text (pts)")
    args = parser.parse_args()

    pages = [int(p.strip()) for p in args.pages.split(",")]

    # Determine lasso rect: manual coords override auto-detect
    if args.lasso:
        x1, y1, x2, y2 = [float(x) for x in args.lasso.split(",")]
        lasso = fitz.Rect(x1, y1, x2, y2)
        print(f"Using manual lasso: {x1:.0f},{y1:.0f},{x2:.0f},{y2:.0f}")
    elif args.issue:
        # Auto-detect coordinates from PDF text
        ISSUE_COORDS = {
            "floating_shelf":    {"page": 3, "search": "F6",   "pad": 70},
            "wall_cabinet_1300": {"page": 3, "search": '34"',  "pad": 80},
            "base_cabinet":      {"page": 0, "search": '34"',  "pad": 60},
            "trash_cabinet":     {"page": 0, "search": "T",    "pad": 40},
        }
        rule = ISSUE_COORDS.get(args.issue)
        if not rule:
            print(f"Unknown issue: {args.issue}")
            print(f"Available: {list(ISSUE_COORDS.keys())}")
            exit(1)

        src_auto = fitz.open(args.input)
        page = src_auto[rule["page"]]
        pad = args.pad if args.pad != 50 else rule["pad"]
        hits = page.search_for(rule["search"])
        if not hits:
            print(f"WARNING: '{rule['search']}' not found on page {rule['page']} — cannot auto-locate")
            print("Use --lasso x1,y1,x2,y2 to specify coordinates manually")
            src_auto.close()
            exit(1)
        rect = hits[0]
        lasso = fitz.Rect(
            rect.x0 - pad, rect.y0 - pad,
            rect.x1 + pad, rect.y1 + pad
        )
        print(f"Auto-detected '{rule['search']}' on page {rule['page']}: {lasso.x0:.0f},{lasso.y0:.0f},{lasso.x1:.0f},{lasso.y1:.0f}")
        src_auto.close()
        # Override pages list to only annotate the detected page
        pages = [rule["page"]]
    else:
        print("Error: must provide --lasso or --issue")
        exit(1)

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
