#!/usr/bin/env python3
"""
find_annotation_coords.py

Finds pixel coordinates of markers or text on a PDF page so they can be
used with annotate_pdf.py --lasso coordinates.

Supports two modes:
  1. Text search: finds bounding box of a string (e.g., "F6", "PL1", "34\"")
  2. Keyword auto-detect: given a discrepancy type, finds the right location

Usage:
    # Find F6 marker on page 2
    python3 find_annotation_coords.py --pdf path/to/drawings_extracted.pdf --page 2 --search "F6"

    # Auto-detect floating shelf location on page 2
    python3 find_annotation_coords.py --pdf path/to/drawings_extracted.pdf --page 2 --issue floating_shelf

    # Auto-detect wall cabinet area on page 2
    python3 find_annotation_coords.py --pdf path/to/drawings_extracted.pdf --page 2 --issue wall_cabinet_1300

Output: "x1,y1,x2,y2" suitable for --lasso argument

Requirements: PyMuPDF (fitz)
"""

import argparse
import fitz


# Auto-detection rules: what to search for given an issue type
ISSUE_SEARCH_RULES = {
    "floating_shelf": {
        "page": 3,  # Suite 1300 page (0-indexed in drawings_extracted.pdf)
        "search": "F6",
        "pad": 80,
        "note": "F6 floating shelf marker on Suite 1300 elevation"
    },
    "wall_cabinet_1300": {
        "page": 3,
        "search": '34"',
        "pad": 80,
        "note": "34\" MAX height callout on Suite 1300 elevation"
    },
    "base_cabinet": {
        "page": 0,  # Suite 1150 page
        "search": '34"',
        "pad": 60,
        "note": "34\" MAX base cabinet height on Suite 1150 elevation"
    },
    "trash_cabinet": {
        "page": 0,
        "search": "T",
        "pad": 40,
        "note": "T/R/C marker (trash cabinet) on elevation"
    },
}


def find_text_coords(doc, page_idx, search_text, pad=50):
    """Find bounding box of search_text on given page, return rect with padding."""
    page = doc[page_idx]
    hits = page.search_for(search_text)
    if not hits:
        return None
    # Get the first hit (topmost/leftmost)
    rect = hits[0]
    # Expand by padding
    padded = fitz.Rect(
        rect.x0 - pad,
        rect.y0 - pad,
        rect.x1 + pad,
        rect.y1 + pad
    )
    return padded


def main():
    parser = argparse.ArgumentParser(description="Find annotation coordinates on a PDF page")
    parser.add_argument("--pdf", required=True, help="Path to PDF")
    parser.add_argument("--page", type=int, required=True, help="0-indexed page number")
    parser.add_argument("--search", help="Text string to search for")
    parser.add_argument("--issue", help="Issue type: floating_shelf, wall_cabinet_1300, base_cabinet, trash_cabinet")
    parser.add_argument("--pad", type=int, default=50, help="Padding around found text (pts)")
    args = parser.parse_args()

    doc = fitz.open(args.pdf)

    # Determine what to search
    search_text = None
    pad = args.pad

    if args.issue:
        rule = ISSUE_SEARCH_RULES.get(args.issue)
        if not rule:
            print(f"Unknown issue type: {args.issue}")
            print(f"Available: {list(ISSUE_SEARCH_RULES.keys())}")
            doc.close()
            return
        search_text = rule["search"]
        pad = rule["pad"]
        print(f"# Issue: {args.issue}")
        print(f"# Searching for: '{search_text}' on page {args.page}")
        print(f"# Note: {rule['note']}")
    elif args.search:
        search_text = args.search
        print(f"# Searching for: '{search_text}' on page {args.page}")
    else:
        print("Error: must provide --search or --issue")
        doc.close()
        return

    rect = find_text_coords(doc, args.page, search_text, pad)

    if rect:
        print(f"{rect.x0:.0f},{rect.y0:.0f},{rect.x1:.0f},{rect.y1:.0f}")
    else:
        print(f"# WARNING: '{search_text}' not found on page {args.page}")
        print("# Use --search to try alternate text strings")
        print("# Use --pad to adjust search sensitivity")

    doc.close()


if __name__ == "__main__":
    main()
