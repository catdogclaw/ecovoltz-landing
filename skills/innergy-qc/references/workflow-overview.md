# Millwork QC Workflow — Plain Language Overview

_Originally drafted 2026-03-23 for sharing with team members unfamiliar with the OpenClaw innergy-qc skill._

This document describes what the innergy-qc skill does when you drop files into `~/Desktop/Incoming_Projects/`.

---

## What happens step by step

**Step 1 — Files arrive**
Files dropped into `~/Desktop/Incoming_Projects/` are noticed. I read through everything to identify the customer, project type, and what files are included.

**Step 2 — Project folder setup**
Files get moved from Incoming into a numbered project folder (e.g., `001_CustomerName/`) with:
- `001_customer_name_input/` — original files preserved here
- `002_customer_name_analysis/` — all my work goes here

**Step 3 — INNERGY spreadsheet is read**
I extract all line items: every cabinet, shelf, top, and filler — dimensions (X, Y, Z), quantity, and suite location. This is my baseline reference.

**Step 4 — Relevant drawing pages are extracted**
The full drawing PDF may be 60+ pages. I pull out just the relevant pages — millwork elevation sheets (A401), floor plans, and spec pages — into a smaller working PDF.

**Step 5 — Drawings are analyzed per suite**
For each suite (break area, copy area, island, etc.):
- Count every cabinet type (base, wall, tall, shelf)
- Measure dimensions from the drawings
- Note quantities
- Save findings as I go

**Step 6 — Completeness check (runs before the spreadsheet)**
Before building the spreadsheet, I check whether INNERGY captured everything:
- Mislabeled items (countertops mislabeled as floating shelves)
- Missing cabinets — in the drawing but not in INNERGY
- Extra items — in INNERGY but not clearly supported by drawings
- Scope linear footage vs actual cabinet widths
- Tall cabinet verification (90" tall cabinets in scope but do drawings show them?)

**Step 7 — Everything is compared**
For every INNERGY line item:
- Does the drawing dimension match? (within 0.5" = fine, more = flagged)
- Does the quantity match what I counted?
- Is it missing entirely?

**Step 8 — Color-coded QC spreadsheet is built**
A fresh spreadsheet — the original INNERGY file is never touched — with drawing dimensions alongside INNERGY dimensions, color coded green/red/orange. Summary tab shows confirmed/discrepancy/review counts per suite.

**Step 9 — Annotated PDFs are created**
For major discrepancies, I create PDFs with the drawing as the base layer and a toggleable annotation layer showing the problem area. Turn annotations on/off in FoxIt or Acrobat.

**Step 10 — Everything is saved to the project folder**
The analysis folder gets the QC spreadsheet, annotated PDFs, completeness report, and all working notes.

---

## Key principles

1. **Never touch the original INNERGY file** — always work on a copy
2. **Chunk the work** — extract drawing pages per suite, not all at once, to avoid context limits
3. **Completeness check first** — catches missing/extra/mislabeled items before building the spreadsheet
4. **Save findings frequently** — write to disk before context hits 75%

---

## Common discrepancy patterns

| Pattern | Likely Cause | Action |
|---------|-------------|--------|
| Drawing has base cabs INNERGY doesn't | Cabinets missed in takeoff | Add line items to InnerGy |
| INNERGY has items not in drawing | Scope item not shown in drawings | Verify with GC/architect |
| Mislabeled floating shelf X>90 Y>20 | Countertop miscategorized | Reclassify as PL Top |
| Scope LF >> actual cabinet widths | Budgeted vs drawn footage | Note variance in bid |
| Missing tall cabs in drawing | Tall cabs in spec but not shown in elevation | Confirm with InnerGy team |
