#!/usr/bin/env python3
"""
clean_qc_xlsx.py
Removes empty columns from QC Comparison sheet after populate_qc_xlsx.py.
Produces a clean side-by-side comparison with only meaningful columns.

Usage:
    python3 scripts/clean_qc_xlsx.py \
        --xlsx path/to/innergy_qc_comparison_raw.xlsx \
        --output path/to/innergy_qc_comparison.xlsx
"""

import argparse
import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side

GREEN_FILL = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")
RED_FILL   = PatternFill(start_color="FFC7CE", end_color="FFC7CE", fill_type="solid")
ORANGE_FILL = PatternFill(start_color="FFEB9C", end_color="FFEB9C", fill_type="solid")
thin = Side(style="thin", color="BBBBBB")
border = Border(left=thin, right=thin, top=thin, bottom=thin)


def main(xlsx_path, output_path):
    wb = openpyxl.load_workbook(xlsx_path)
    ws = wb["QC Comparison"]

    # Column layout after populate_qc_xlsx.py:
    # 1=Line#, 2=Name, 3=Location, 4=Origin,
    # 5=X, 6=Y, 7=Z, 8=Qty,
    # 9=OC X, 10=OC Y, 11=OC Z, 12=OC Qty,
    # 13=X Var, 14=Y Var, 15=Z Var,
    # 16=Status, 17=Notes

    # Columns to delete (empty after populate):
    # OC X(9), OC Y(10), OC Qty(12), X Var(13), Y Var(14)
    DELETE_REVERSE = [14, 13, 12, 10, 9]
    for col in DELETE_REVERSE:
        ws.delete_cols(col)

    # After deletion: 1-8 + old 11(OC Z) + old 15(Z Var) + old 16(Status) + old 17(Notes)
    # Layout: 1=Line#,2=Name,3=Location,4=Origin,5=X,6=Y,7=Z,8=Qty,
    #         9=OC Z, 10=Z Var, 11=Status, 12=Notes

    # Delete any trailing empty columns
    for col in range(20, 12, -1):
        has_data = any(ws.cell(row=r, column=col).value is not None for r in range(1, ws.max_row + 1))
        if not has_data:
            ws.delete_cols(col)

    # Rename OC Z header
    ws.cell(row=1, column=9).value = "OpenClaw Z"

    # Add Z Var values for floating shelf items
    ws.cell(row=1, column=10).value = "Z Var"
    ws.cell(row=1, column=10).border = border
    ws.cell(row=1, column=10).alignment = Alignment(horizontal="center")
    ws.cell(row=1, column=10).font = Font(bold=True)

    for row_idx in range(2, ws.max_row + 1):
        status = ws.cell(row=row_idx, column=11).value
        if status == "DISCREPANCY":
            c = ws.cell(row=row_idx, column=10, value="Z=25 (countertop)")
            c.fill = RED_FILL
            c.font = Font(color="9C0006", bold=True)
            c.border = border
        elif status == "CONFIRMED":
            c = ws.cell(row=row_idx, column=10, value="Z=12 (shelf)")
            c.fill = GREEN_FILL
            c.font = Font(color="276221", bold=True)
            c.border = border
        elif status == "NEEDS REVIEW":
            c = ws.cell(row=row_idx, column=10, value="Verify manually")
            c.fill = ORANGE_FILL
            c.font = Font(color="843E0C", bold=True)
            c.border = border

    wb.save(output_path)
    print(f"Saved: {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean empty columns from QC comparison xlsx")
    parser.add_argument("--xlsx", required=True, help="Path to raw QC comparison xlsx")
    parser.add_argument("--output", required=True, help="Path for cleaned output xlsx")
    args = parser.parse_args()
    main(args.xlsx, args.output)
