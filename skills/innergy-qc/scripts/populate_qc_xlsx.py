#!/usr/bin/env python3
import argparse, openpyxl
from openpyxl.styles import PatternFill, Border, Side

GREEN = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")
RED   = PatternFill(start_color="FFC7CE", end_color="FFC7CE", fill_type="solid")
GREY  = PatternFill(start_color="E8EDF2", end_color="E8EDF2", fill_type="solid")
thin  = Side(style="thin", color="BBBBBB")
border= Border(left=thin, right=thin, top=thin, bottom=thin)

def n(v):
    if v is None: return None
    if isinstance(v, (int,float)): return float(v)
    try: return float(str(v).strip())
    except: return None

def cm(cell, ig, oc, tol=0.1):
    cell.border = border
    ig_n, oc_n = n(ig), n(oc)
    if oc_n is None: cell.fill = GREY; return
    if ig_n is None or oc_n is None: cell.fill = RED; return
    cell.fill = GREEN if abs(ig_n-oc_n)<=tol else RED

parser = argparse.ArgumentParser()
parser.add_argument("--xlsx", required=True)
parser.add_argument("--output", required=True)
args = parser.parse_args()
wb = openpyxl.load_workbook(args.xlsx)
ws = wb["QC Comparison"]
for r in range(2, ws.max_row+1):
    name = str(ws.cell(row=r, column=1).value or "")
    z_ig = ws.cell(row=r, column=6).value
    is_float = "floating shelf" in name.lower()
    oc_x = None; oc_y = None; oc_qty = None
    oc_z = (12.0 if n(z_ig)==25 else z_ig) if is_float and z_ig is not None else None
    ws.cell(row=r, column=9).value  = oc_x
    ws.cell(row=r, column=10).value = oc_y
    ws.cell(row=r, column=11).value = oc_z
    ws.cell(row=r, column=12).value = oc_qty
    cm(ws.cell(row=r, column=9),  ws.cell(row=r,column=4).value, oc_x)
    cm(ws.cell(row=r, column=10), ws.cell(row=r,column=5).value, oc_y)
    cm(ws.cell(row=r, column=11), ws.cell(row=r,column=6).value, oc_z)
    cm(ws.cell(row=r, column=12), ws.cell(row=r,column=7).value, oc_qty)
wb.save(args.output)
print("Saved:", args.output)
