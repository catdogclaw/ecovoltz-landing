#!/usr/bin/env python3
"""
extract_pages.py
Extracts specific pages from a source PDF.
Used to create a millwork-only drawing subset for reduced token load.
"""

import argparse
import fitz
import os


def extract_pages(input_pdf, output_pdf, pages):
    """
    Extract specified pages from input_pdf and save to output_pdf.

    Args:
        input_pdf: Path to source PDF
        output_pdf: Path to output PDF
        pages: Comma-separated page numbers (1-indexed, e.g. "1,5,6,25,26")
    """
    doc = fitz.open(input_pdf)

    page_list = []
    for p in pages.split(","):
        p = p.strip()
        if "-" in p:
            start, end = p.split("-")
            page_list.extend(range(int(start), int(end) + 1))
        else:
            page_list.append(int(p))

    # Convert to 0-indexed
    page_list = [p - 1 for p in page_list]

    out_doc = fitz.open()
    for idx in page_list:
        if 0 <= idx < len(doc):
            out_doc.insert_pdf(doc, from_page=idx, to_page=idx)

    out_doc.save(output_pdf)
    out_doc.close()
    doc.close()

    print(f"Extracted {len(page_list)} pages to {output_pdf}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract specific pages from a PDF")
    parser.add_argument("--input", required=True, help="Source PDF path")
    parser.add_argument("--output", required=True, help="Output PDF path")
    parser.add_argument(
        "--pages",
        required=True,
        help='Comma-separated page numbers (1-indexed), e.g. "1,5,6,25,26" or ranges "1-10"',
    )

    args = parser.parse_args()
    extract_pages(args.input, args.output, args.pages)
