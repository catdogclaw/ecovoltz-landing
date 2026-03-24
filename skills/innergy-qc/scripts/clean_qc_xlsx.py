#!/usr/bin/env python3
"""
clean_qc_xlsx.py
Cleans up the QC comparison xlsx:
- Removes trailing empty columns (13+)
- Keeps all OC columns (OC X, OC Y, OC Z, OC Qty) even if empty for side-by-side display
- Colors OC cells: green=match, red=mismatch, grey=no data
- Renames "OpenClaw Z" → "OC Z"

Final layout: Line#, Name, Location, Origin, X, Y, Z, Qty, OC X, OC Y, OC Z, OC Qty

Usage:
    python3 scripts/clean_qc_xlsx.py \
        --xlsx path/to/populate_output.xlsx \
        --output path/to/innergy_qc_comparison.xlsx
"""

import argparse
import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side

GREEN_FILL  = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")
RED_FILL    = PatternFill(start_color="FFC7CE", end_color="FFC7CE", fill_type="solid")
GREY_FILL   = PatternFill(start_color="E8EDF2", end_color="E8EDF2", fill_type="solid")
HEADER_FILL = PatternFill(start_color="1E3A5F", end_color="1E3A5F", fill_type="solid")
thin = Side(style="thin", color="BBBBBB")
border = Border(left=thin, right=thin, top=thin, bottom=thin)


def num(v):
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    try:
        return float(str(v).strip())
    except (ValueError, TypeError):
        return None


def color_cell(cell, ig_val, oc_val, tol=0.1):
    cell.border = border
    ig_n = num(ig_val)
    oc_n = num(oc_val)
    if oc_n is None:
        cell.fill = GREY_FILL
        return
    if ig_n is None or oc_n is None:
        cell.fill = RED_FILL
        return
    if abs(ig_n - oc_n) <= tol:
        cell.fill = GREEN_FILL
    else:
        cell.fill = RED_FILL


def main(xlsx_path, output_path):
    wb = openpyxl.load_workbook(xlsx_path)
    ws = wb["QC Comparison"]

    # 1. Delete trailing empty columns (13+)
    for col in range(ws.max_column, 12, -1):
        ws.delete_cols(col)

    # 2. Rename any "OpenClaw Z" header to "OC Z" (could be col 9, 10, 11, or 12)
    for col in range(1, ws.max_column + 1):
        hdr = ws.cell(row=1, column=col).value
        if hdr and "openclaw" in str(hdr).lower() and "z" in str(hdr).lower():
            ws.cell(row=1, column=col).value = "OC Z"

    # 3. Set final headers in correct order
    final_headers = ["Line #", "Name", "Location", "Origin",
                     "X", "Y", "Z", "Qty",
                     "OC X", "OC Y", "OC Z", "OC Qty"]
    for col_idx, hdr in enumerate(final_headers, 1):
        c = ws.cell(row=1, column=col_idx)
        c.value = hdr
        c.fill = HEADER_FILL
        c.font = Font(bold=True, color="FFFFFF")
        c.border = border
        c.alignment = Alignment(horizontal="center")

    # 4. Color OC cells (cols 9-12 = OC X, OC Y, OC Z, OC Qty)
    for row_idx in range(2, ws.max_row + 1):
        for col in range(9, 13):
            ig_col = col - 8  # corresponding INNERGY col: 1=X, 2=Y, 3=Z, 4=Qty
            ig_val = ws.cell(row=row_idx, column=ig_col).value
            oc_val = ws.cell(row=row_idx, column=col).value
            color_cell(ws.cell(row=row_idx, column=col), ig_val, oc_val)

    # 5. QC Summary legend
    ws_sum = wb["QC Summary"]
    ws_sum["A1"] = "QC Summary — 595 Market Street Run 3"
    ws_sum["A1"].font = Font(bold=True, size=14)
    ws_sum["A2"] = "Legend:"
    ws_sum["A3"] = "Green = OC matches INNERGY (correct)"
    ws_sum["A3"].fill = GREEN_FILL
    ws_sum["A4"] = "Red = OC differs from INNERGY (mismatch)"
    ws_sum["A4"].fill = RED_FILL
    ws_sum["A5"] = "Grey = No OC data available"
    ws_sum["A5"].fill = GREY_FILL
    ws_sum["A7"] = "Dimension Reference:"
    ws_sum["A8"] = "X = width (face width)"
    ws_sum["A9"] = "Y = length (piece length)"
    ws_sum["A10"] = "Z = depth (front-to-back)"
    ws_sum["A11"] = "Z=12 = floating shelf depth (correct)"
    ws_sum["A12"] = "Z=25 = countertop depth (mislabeled)"

    wb.save(output_path)
    print(f"Saved: {output_path}")
    print(f"Final columns: {final_headers}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--xlsx", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    main(args.xlsx, args.output)
