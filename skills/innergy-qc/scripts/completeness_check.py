#!/usr/bin/env python3
"""
completeness_check.py
Compares drawing cabinet counts against INNERGY line item counts.
Identifies: mislabeled items, missing cabinets, extra items, scope LF discrepancies.
"""

import argparse
import fitz
import openpyxl
import re
from collections import defaultdict

CABINET_MARKERS = {
    "PL1": "Plastic laminate cabinet type 1",
    "PL2": "Plastic laminate cabinet type 2",
    "SS1": "Solid surface shelf/counter type 1",
    "SS2": "Solid surface shelf/counter type 2",
    "F6":  "Floating shelf marker (F6 on drawings — verify Z depth!)",
    "F1":  "Filler/panel F1",
    "F2":  "Filler/panel F2",
    "F3":  "Filler/panel F3",
    "F4":  "Filler/panel F4",
    "F5":  "Filler/panel F5",
    # NOTE: These are MATERIAL types, NOT cabinet types:
    "P1":  "Paint finish on wall panels — NOT a cabinet type",
    "ST3": "Stone/tile backsplash material — NOT a cabinet type",
    "B1":  "Rubber base material (Johnsonite) — NOT a cabinet variant",
    "B2":  "Rubber base material (Johnsonite) — NOT a cabinet variant",
}


def get_drawing_markers(doc, page_idx):
    page = doc[page_idx]
    blocks = page.get_text("dict", flags=11)["blocks"]
    items = []
    for block in blocks:
        if "lines" not in block:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                text = span["text"].strip()
                x, y = span["origin"]
                fs = span.get("size", 0)
                if not text:
                    continue
                if text in CABINET_MARKERS:
                    items.append({"type": text, "label": CABINET_MARKERS[text], "x": x, "y": y, "fs": fs})
                if re.match(r"^\d+'-?\d*\"?$", text) or re.match(r"^\d+/\d+\"?$", text):
                    items.append({"type": "DIM", "label": text, "x": x, "y": y, "fs": fs})
    return items


def estimate_cabinet_count_by_type(doc, page_idx):
    items = get_drawing_markers(doc, page_idx)
    counts = defaultdict(int)
    for item in items:
        if item["type"] in CABINET_MARKERS:
            counts[item["type"]] += 1
    return dict(counts)


def count_innergy_items(qc_xlsx_path):
    wb = openpyxl.load_workbook(qc_xlsx_path, data_only=True)
    ws = wb["QC Comparison"]
    suite_items = defaultdict(lambda: defaultdict(int))
    for row in ws.iter_rows(min_row=2, values_only=True):
        name = str(row[1] or "")
        loc = str(row[2] or "")
        suite = loc.split(" - (")[0].strip() if " - (" in loc else loc.split(" - ")[0].strip()
        n = name.lower()
        if "tall" in n:
            itype = "TALL_CAB"
        elif "wall" in n:
            itype = "WALL_CAB"
        elif "trash" in n:
            itype = "TRASH_CAB"
        elif "base door" in n or "base drawer" in n or "base mw" in n:
            itype = "BASE_CAB"
        elif "floating shelf" in n:
            itype = "FLOATING_SHELF"
        elif "diewall" in n:
            itype = "DIEWALL"
        elif "panel filler" in n:
            itype = "PANEL_FILLER"
        elif "coat rod" in n:
            itype = "COAT_ROD"
        elif "plywood subtop" in n:
            itype = "PLYWOOD_SUBTOP"
        elif "solid surface" in n:
            itype = "SOLID_SURFACE"
        elif "add." in n or "general conditions" in n:
            itype = "IGNORE"
        elif any(k in n for k in ["top", "counter"]):
            itype = "TOP_COUNTER"
        else:
            itype = "OTHER"
        if itype != "IGNORE":
            suite_items[suite][itype] += 1
    wb.close()
    return dict(suite_items)


def check_mislabeled_floating_shelves(qc_xlsx_path):
    """
    Check floating shelf items for mislabeling.
    DIMENSION AXES (INNERGY convention):
      X = width  (face width of piece)
      Y = length (horizontal piece length)
      Z = depth  (front-to-back — THIS IS WHAT MATTERS)

    RULE: Floating shelf standard depth = Z=12"
           Countertop depth = Z=25"

    A "Floating Shelf PL" item with Z=25" is mislabeled — it is a countertop.
    Additionally, Y>90" + Z=25" is a redundant confirmation signal (long countertop pieces).

    ALSO CHECK: Items with Y>90" AND Z=25" are definitely countertops mislabeled as shelves.
    """
    wb = openpyxl.load_workbook(qc_xlsx_path, data_only=True)
    ws = wb["QC Comparison"]
    mislabeled = []
    correct = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        name = str(row[1] or "")
        x = row[4]  # X = width
        y = row[5]  # Y = length
        z = row[6]  # Z = depth (THIS is the check)
        if "floating shelf" in name.lower() and z is not None:
            try:
                z_val = float(z)
                y_val = float(y) if y is not None else 0
                item = {
                    "name": name,
                    "x": float(x) if x is not None else None,
                    "y": y_val,
                    "z": z_val,
                    "loc": str(row[2] or "")[:60],
                }
                if z_val == 25:
                    # Z=25 is countertop depth — mislabeled
                    item["likely"] = "COUNTERTOP (Z=25)"
                    item["signal"] = "Z=25 confirms countertop depth"
                    mislabeled.append(item)
                elif z_val == 12:
                    # Z=12 is floating shelf depth — correctly labeled
                    item["likely"] = "FLOATING SHELF (Z=12)"
                    item["signal"] = "Z=12 matches shelf depth"
                    correct.append(item)
                else:
                    # Non-standard depth
                    item["likely"] = f"UNUSUAL (Z={z_val})"
                    item["signal"] = "Check Z manually"
                    mislabeled.append(item)
            except (ValueError, TypeError):
                pass
    wb.close()
    return mislabeled, correct


def run_completeness_check(drawing_pdf_path, qc_xlsx_path, drawing_page_map, output_path=None):
    doc = fitz.open(drawing_pdf_path)
    innergy_counts = count_innergy_items(qc_xlsx_path)
    mislabeled, correct = check_mislabeled_floating_shelves(qc_xlsx_path)
    lines = [
        "# Completeness Check Report",
        f"*Drawing:* `{drawing_pdf_path}`",
        f"*QC Spreadsheet:* `{qc_xlsx_path}`",
        "",
        "## IMPORTANT: Dimension Reference",
        "",
        "Before reviewing findings, confirm the INNERGY dimension axes:",
        "- **X** = width  (horizontal face width)",
        "- **Y** = length (horizontal piece length)",
        "- **Z** = depth  (front-to-back — THIS is the floating shelf check dimension)",
        "",
        "**Floating shelf depth = Z=12\"**",
        "**Countertop depth = Z=25\"**",
        "",
        "A mislabeled floating shelf has Z=25 (countertop depth).",
        "",
    ]

    if mislabeled:
        mis_z25 = [m for m in mislabeled if "COUNTERTOP" in m.get("likely", "")]
        lines += [
            f"## 🔴 MISLABELED Floating Shelves ({len(mis_z25)} items with Z=25 — countertops)",
            "",
            "| Suite | Name | X | Y | Z | Signal |",
            "|-------|------|---|---|---|--------|",
        ]
        for m in mislabeled:
            likely = m.get("likely", "UNKNOWN")
            signal = m.get("signal", "")
            lines.append(f"| {m['loc'][:25]} | {m['name'][:40]} | {m.get('x', 'N/A'):.2f if isinstance(m.get('x'), float) else 'N/A'} | {m.get('y', 0):.2f} | {m.get('z', 0):.2f} | {signal} |")
        lines.append("")
        lines.append(f"**🔴 Action:** Reclassify {len(mis_z25)} items as PL Tops in InnerGy. Z=25 = countertop depth, not shelf.\n")

    if correct:
        lines += [
            f"## ✅ Correctly Labeled Floating Shelves ({len(correct)} items with Z=12)",
            "",
            "| Suite | Name | X | Y | Z |",
            "|-------|------|---|---|---|",
        ]
        for c in correct:
            lines.append(f"| {c['loc'][:25]} | {c['name'][:40]} | {c.get('x', 'N/A'):.2f if isinstance(c.get('x'), float) else 'N/A'} | {c.get('y', 0):.2f} | {c.get('z', 0):.2f} |")
        lines.append("")
        lines.append(f"**✅ These {len(correct)} items are correctly labeled.** Z=12 matches floating shelf depth.\n")

    lines += [
        "## Drawing Cabinet Marker Counts (from A401 elevation sheets)",
        "",
        "| Marker | Count | Description |",
        "|--------|-------|-------------|",
    ]
    for page_idx, suite_name in sorted(drawing_page_map.items()):
        counts = estimate_cabinet_count_by_type(doc, page_idx)
        lines.append(f"### {suite_name} (source page {page_idx + 1})")
        lines.append("")
        if counts:
            for marker, count in sorted(counts.items(), key=lambda x: -x[1]):
                lines.append(f"| `{marker}` | {count} | {CABINET_MARKERS.get(marker, 'N/A')} |")
        else:
            lines.append("*No cabinet type markers found on this page.*")
        lines.append("")

    lines += [
        "## INNERGY Line Item Counts",
        "",
        "| Suite | Item Type | Count |",
        "|-------|-----------|-------|",
    ]
    for suite, items in sorted(innergy_counts.items()):
        for itype, count in sorted(items.items(), key=lambda x: -x[1]):
            lines.append(f"| {suite[:35]} | {itype} | {count} |")

    lines += [
        "",
        "## Completeness Assessment",
        "",
        "### Questions to Answer per Suite:",
        "1. **Base cabinets:** Count P1 markers on drawing vs. `BASE_CAB + TRASH_CAB` in INNERGY per suite",
        "2. **Wall cabinets:** Count ST3 markers on drawing vs. `WALL_CAB` in INNERGY per suite",
        "3. **Tall cabinets:** Confirm 90\" tall cabinets exist in drawings (not just in scope spec)",
        "4. **Floating shelves:** Confirm actual shelf dimensions match INNERGY floating shelf line items",
        "5. **Tops/Countertops:** Counters should appear as PL Top items, NOT floating shelves",
        "6. **Scope LF:** Compare stated LF in scope vs. sum of cabinet face widths in INNERGY",
        "",
        "## Common Patterns",
        "",
        "| Pattern | Likely Cause | Action |",
        "|---------|-------------|--------|",
        "| Drawing has base cabs INNERGY doesn't | Cabinets missed in takeoff | Add to InnerGy |",
        "| INNERGY has items not in drawing | Scope item not shown in drawings | Verify with GC/architect |",
        "| Mislabeled floating shelf Z=25 | Countertop depth (Z=25) mislabeled as shelf (Z=12) | Reclassify as PL Top |",
        "| Scope LF >> actual cab widths | Budgeted vs. drawn footage | Note variance in bid |",
    ]

    doc.close()
    report = "\n".join(lines)
    if output_path:
        with open(output_path, "w") as f:
            f.write(report)
        print(f"Completeness report saved: {output_path}")
    else:
        print(report)
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--drawing", required=True)
    parser.add_argument("--innergy", required=True)
    parser.add_argument("--output", help="Path for output markdown report")
    args = parser.parse_args()
    page_map = {
        "Suite 1150": 43,
        "Suite 1275/1285": 44,
        "Suite 1300": 45,
    }
    run_completeness_check(args.drawing, args.innergy, page_map, args.output)
