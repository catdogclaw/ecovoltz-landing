# innergy-qc — Millwork Estimating QC Workflow

Verifies that the millwork company bid (INNERGY output) accurately reflects the customer's scope and the architectural drawings. Compares customer inputs → scope → drawings → INNERGY → review documents.

**Input:** Customer-supplied files (specs, drawings, millwork company bid/INNERGY spreadsheet, optional: millwork company quote)
**Output:** Scope summary, color-coded QC spreadsheet, layered annotated PDFs, executive summary

---

## Core Principles

**Verify from primary source, not prior runs.** Each project run must verify dimensions directly from the drawing PDFs — do not assume prior-run findings about cabinet heights, widths, or marker meanings are correct without confirming them on the current drawings. Drawing conventions vary by project.

**Extract dimension strings before interpreting them.** Never infer what a dimension string means without seeing its position and context on the drawing. Extract all labeled dimensions first, map them to what they annotate, then build rules.

**Flag uncertainty explicitly.** When you are inferring meaning (e.g., "this label must be the wall cabinet height"), state the inference and the reasoning. Do not present inferences as facts.

---

## Project Setup (PREP)

When files appear in `~/Desktop/Incoming_Projects/`:

1. Create a numbered project folder:
   ```
   ~/Desktop/Projects/001_ProjectName/
     001_project_name_input/
     002_project_name_analysis/
   ```
2. Copy ALL original files to `001_*_input/` — never modify originals
3. Note the project name, customer, and date

**⏸️ Gate:** Confirm files moved, project folder ready.
- **[C] Continue** → Proceed to Step 1
- **[S] Stop** → Save state, end analysis

---

## Workflow

### Step 1 — Intake & File Audit

Two-phase approach: fast scan first, then detailed review.

**Phase 1A — Quick Text Scan (all files):**
- Scan every file with PyMuPDF (PDF) or openpyxl (spreadsheet)
- Record: filename, type, page/sheet count, size
- Identify file types: architectural drawing, spec, proposal, bid spreadsheet, scope doc, etc.
- Note any suites or LF references visible in raw text

**Phase 1B — Detailed Review (key files):**
- For the main drawing PDF: scan all pages for cabinet marker keywords and suite labels
- Identify which pages contain elevation drawings (A401/A402/etc.)
- Identify which pages contain floor plans, sections, and details
- Flag any unusual items or concerns

Save findings to `scratch/file_audit.md`.

**Context check:** Before proceeding, check session context. If >70% full, summarize and compact first.

**⏸️ Gate:**
- **[C] Continue** → Check context → Proceed to Step 2
- **[R] Show Results** → Display full file audit
- **[S] Stop** → Save state, end analysis

---

### Step 2 — Scope Extraction

**⚠️ IMPORTANT: Scope comes from customer-supplied documents only.** Do NOT use the millwork company's proposal, bid, or takeoffs as the source of scope. Those are what you're verifying against.

Read customer-supplied scope documents (specs, SOW, RFIs, scope letters). Extract:
- Project name, customer, location
- Suites / areas explicitly in scope
- Authorized linear footage (LF) per suite — only what is stated in customer docs
- Cabinet types specified (base, wall, tall, floating shelf, etc.)
- Special items (solid surface, DieWall, fillers, etc.)
- Exclusions or items noted as "by others"
- Drawing sheet references (A401, A102, etc.)

**If LF is not stated in customer docs:** Note this — LF must be calculated from drawings in Step 4.

Save to `scope_summary.md` in `002_*_analysis/`.

**Context check:** If >70% full, compact before proceeding.

**⏸️ Gate:**
- **[C] Continue** → Check context → Proceed to Step 3
- **[R] Show Results** → Display scope summary
- **[S] Stop** → Save state, end analysis

---

### Step 3 — Drawing Reduction

Large drawing sets often contain structural, electrical, HVAC, and other non-millwork pages. Reduce to millwork-relevant pages to minimize token load.

**Two approaches — use both:**

**Phase 3A — Text-Based Filtering (fast):**
1. Scan all pages with PyMuPDF
2. Score each page by presence of: cabinet markers (PL1, PL2, SS1, SS2), suite labels, A401/A102/A604-A607 sheet references
3. Flag pages with elevation drawings and floor plans showing casework

**Phase 3B — Vision Verification (recommended for critical suites):**
1. Render key candidate pages as JPEG images (~1.5x zoom)
2. Use vision to confirm the page is a millwork elevation (not a structural plan, detail, or legend page)
3. This catches false positives — pages that mention cabinet markers in a legend or schedule but aren't actually elevation drawings

Extract confirmed millwork pages to `drawings_extracted.pdf`:

```bash
python3 scripts/extract_pages.py \
  --input "path/to/source_drawing.pdf" \
  --output "path/to/analysis/drawings_extracted.pdf" \
  --pages "44,45,46"
```

**⚠️ Page numbers are 1-indexed** (page 1 = first page of the PDF, same as human page numbers). Always verify with a text scan first.

Save extracted page list to `scratch/drawing_pages_extracted.md`.

**Phase 3C — Full Source Scan for Millwork Requirements (CRITICAL — do not skip):**

After extracting elevation pages, scan the **FULL source PDF** (all pages, not just extracted ones) for millwork-relevant construction notes. These notes often appear on general notes pages, finish schedules, or detail sheets that are NOT elevation pages but still contain requirements that affect the bid.

**Search the FULL source PDF for these patterns on EVERY page:**
```
"PROVIDE" + any of: cabinet, counter, vanity, shelf, panel, millwork, bracket, support, blocking, backing
"NOTE" + any of: cabinet, counter, vanity, millwork, bracket, support, blocking, backing, in-wall
"IN-WALL"
"BRACKET" (anywhere in text)
"BACKING" / "BLOCKING" (required for wall-mounted equipment)
"STRUCTURAL STEEL" near millwork terms
"UNDERCOUNTER" + support/brackets
```

**Output:** Save a `drawing_requirements_checklist.md` file listing every millwork-relevant note found across ALL pages of the source PDF, with:
- Page number
- The full note text
- Which suite(s) it applies to (if identifiable)

**This is the independent check that catches gaps the operator may have missed in INNERGY.** Compare this checklist against the INNERGY scope before generating QC deliverables — not after.

Example checklist entry:
```markdown
### Page 31 — Note 31
**Text:** "PROVIDE UNDERCOUNTER WORKSURFACE SUPPORT BRACKETS AT ALL BUILT IN WORKSURFACES. USE IN-WALL STEEL WHERE POSSIBLE."
**Applies to:** ALL suites with built-in countertops/vanities
**INNERGY coverage:** [to be filled during Step 5]
**Status:** ✅ covered / ❌ gap
```

**Context check:** If >70% full, compact before proceeding.

**⏸️ Gate:**
- **[C] Continue** → Check context → Proceed to Step 4. Ensure `drawing_requirements_checklist.md` is saved to `002_*_analysis/` — it feeds into Step 6 completeness check.
- **[R] Show Results** → Show original page count vs. extracted count, list included pages + any millwork notes found
- **[S] Stop** → Save state, end analysis

---

### Step 4 — Drawing Capture (Per Suite)

Two-phase analysis for maximum accuracy. Do NOT rely on text-based marker counting alone — it miscounts cabinets by conflating schedule entries, legends, and material codes with actual cabinet instances.

**Phase 4A — Quick Text Scan (per page):**
1. Extract text from each elevation drawing page
2. Use regex to find cabinet marker occurrences: `\b(PL1|PL2|SS1|SS2|F6)\b`
3. Get rough counts — useful for comparing pages but NOT for accurate cabinet counts
4. This phase is fast and gives a sense of which pages are busiest

**Phase 4B — Vision Deep Analysis (required for accuracy):**
1. Render each elevation page as a JPEG image (~1.5x zoom, save to `scratch/`)
2. Use vision to analyze the page with this prompt:

```
This is sheet [A401] interior elevations for Suite [XXXX]. Analyze carefully:

1. List ALL cabinet/material markers visible (PL1, PL2, SS1, SS2, B1, B2, F1-F6, EQ, T/R/C, etc.)
2. Width dimensions for each cabinet section shown
3. NEW (N) vs EXISTING (E) labels
4. Trash cabinets (T/R/C), coat rods, solid surface counters, floating shelves
5. Count DISTINCT cabinet sections by type (not total marker occurrences)
6. Base cabinet heights labeled
7. Any cabinet schedule on this sheet? What does it list?
```

**⚠️ CRITICAL MARKER INTERPRETATION — Do not assume these are cabinet types:**

| Marker | What It Actually Is |
|--------|-------------------|
| `P1` | Paint finish on wall panels — NOT a cabinet type |
| `ST3` | Stone/tile backsplash material — NOT a small wall cabinet |
| `B1`, `B2` | Rubber base material (Johnsonite) — NOT a base cabinet variant |
| `EQ1–EQ9` | "Equal" spacing designation — NOT a cabinet type |
| `T`, `R`, `C` | Trash/Recycle/Compost — features WITHIN base cabinets, not separate cabinets |
| `F1–F6` | Filler/panel pieces — actual cabinet fragments but often missed in takeoff |

**What to actually count (from vision):**
- PL1 = Plastic laminate cabinet finish
- PL2 = Plastic laminate type 2 (different color/pull)
- SS1/SS2 = Solid surface countertop material
- F6 = Floating shelf marker (where used)
- Distinct cabinet SECTION counts (base runs, upper runs, islands)

**⚠️ REQUIRED: Extract dimension strings before recording findings.**

After vision analysis, extract ALL dimension callout strings from the drawing page with their positions. This is how you know WHAT each dimension actually labels:

```python
import fitz
doc = fitz.open('drawings_extracted.pdf')
page = doc[page_idx]

# Extract all dimension text with positions
dims = []
for b in page.get_text('dict')['blocks']:
    if b['type'] == 0:
        for line in b['lines']:
            for span in line['spans']:
                text = span['text'].strip()
                bbox = span['bbox']
                # Filter to dimension-like strings (with ' or ")
                if any(c in text for c in ['"', "'"]) and any(c.isdigit() for c in text):
                    dims.append({"text": text, "x": bbox[0], "y": bbox[1]})

# Sort by y (top to bottom), then group by x position (left to right)
dims.sort(key=lambda d: (d['y'], d['x']))
for d in dims:
    print(f"  y={d['y']:.0f}  x={d['x']:.0f}: {d['text']}")
```

**What to look for:**
- Base cabinet height: usually "34" or "34\" MAX" near base cabinets
- Wall cabinet heights: usually smaller dimensions (1'-2", 1'-4", 1'-8", etc.) near upper cabinets
- Total runs: larger dimensions like "7'-6"" or "16'-0"" at the bottom or sides
- Floating shelf locations: F6 or F4 markers near shelf callouts

**⚠️ Map dimensions to what they label — don't assume.** A dimension string appearing near a cabinet section does not automatically mean it labels that section. Cross-reference with multiple dimension strings on the same vertical or horizontal line.

**For each suite, record:**
- Suite name and floor
- Cabinet sections by type (base runs, upper runs, islands)
- Width of each distinct section (from dimensions on drawing)
- **Actual dimension callouts with their x,y positions** (from extraction above)
- Special items: trash pull-outs, coat rods, solid surface, floating shelves
- Base height: from drawing callout (not assumed — confirm from extraction)
- Wall cabinet height: from drawing callout (confirm from extraction)
- Total calculated LF: sum of cabinet face widths
- Comparison to stated LF from Step 2 scope

Save per-suite findings to `scratch/findings_[suite].md`.

**Context check:** Vision analysis uses significant tokens. Check context after each 2–3 suites. Compact if >60% full.

**⏸️ Gate per suite:**
- **[C] Continue** → Check context → Move to next suite (or Step 5 if last)
- **[R] Show Results** → Display suite findings so far
- **[S] Stop** → Save state, end analysis

**Context check:** If >70% full between suites, compact before continuing.

---

### Step 5 — INNERGY Extraction

Extract all line items from the INNERGY estimating spreadsheet:

```bash
python3 scripts/modify_spreadsheet.py \
  --input "path/to/INNERGY.xlsx" \
  --output "path/to/analysis/innergy_qc.xlsx"
```

This creates an xlsx with all line items: X, Y, Z dimensions, quantities, suite/location, pricing chain.

If the xlsx already exists from a prior run, skip this step.

**Context check:** If >70% full, compact before proceeding.

**⏸️ Gate:**
- **[C] Continue** → Check context → Proceed to Step 6
- **[R] Show Results** → Show item count per suite, top-level summary
- **[S] Stop** → Save state, end analysis

---

### Step 6 — Completeness Check

**⚠️ BEFORE RUNNING ANY DISCREPANCY RULE — Verify from drawing dimensions first.**

Run this extraction to get actual dimension callouts from the drawings:

```python
import fitz
doc = fitz.open('drawings_extracted.pdf')
for page_idx in [0, 1, 2]:  # each extracted suite page
    page = doc[page_idx]
    dims = []
    for b in page.get_text('dict')['blocks']:
        if b['type'] == 0:
            for line in b['lines']:
                for span in line['spans']:
                    text = span['text'].strip()
                    bbox = span['bbox']
                    if any(c in text for c in ['"', "'"]) and any(c.isdigit() for c in text):
                        dims.append({"text": text, "x": bbox[0], "y": bbox[1]})
    dims.sort(key=lambda d: (d['y'], d['x']))
    print(f"=== Page {page_idx} dimensions ===")
    for d in dims:
        print(f"  y={d['y']:.0f}  x={d['x']:.0f}: {d['text']}")
```

**Review the output and manually map each dimension to what it labels** before coding any discrepancy rules. Ask:
- Is this dimension callout for the base cabinet, wall cabinet, or total run?
- What does each smaller dimension (e.g., 1'-8") actually annotate?
- Do the tall (total) dimensions confirm the section heights?

**⚠️ DIMENSION VERIFICATION — Before flagging any discrepancy:**

> **Confirm the INNERGY dimension axes:**
> - **X** = width (horizontal face width)
> - **Y** = length (horizontal piece length)
> - **Z** = depth (front-to-back — **THIS is the check dimension**)
>
> **Floating shelf depth = Z=12"**
> **Countertop depth = Z=25"**
>
> A "Floating Shelf PL" with Z=25 is **mislabeled** — it is a countertop.

**Automated check:** Run `completeness_check.py` — it now auto-flags floating shelf items by Z dimension and separates mislabeled (Z=25) from correctly labeled (Z=12).

Run the completeness check comparing drawing findings against INNERGY line items:

```bash
python3 scripts/completeness_check.py \
  --drawing "path/to/drawings_extracted.pdf" \
  --innergy "path/to/analysis/innergy_qc.xlsx" \
  --output "path/to/analysis/completeness_report.md"
```

**This step checks for:**
1. **Mislabeled items** — floating shelf X > 90" AND Y > 20" → almost certainly a PL Top / Countertop mislabeled
2. **Missing cabinets** — cabinets in drawing with no corresponding INNERGY line item
3. **Missing F1–F6 filler/panel pieces** — drawing shows F-markers but no corresponding INNERGY items
4. **Missing tall cabinets** — scope authorizes 90" tall cabinets but drawings may not show them clearly
5. **Extra items** — INNERGY has line items with no drawing evidence
6. **Dimension discrepancies** — drawing dimensions vs. INNERGY dimensions differ
7. **Scope LF** — stated LF vs. sum of cabinet face widths
8. **Drawing Requirements Checklist** — Cross-reference `drawing_requirements_checklist.md` (from Phase 3C) against INNERGY scope. Every note in the checklist must have a corresponding INNERGY line item or must be flagged as a gap. This is the most common miss — millwork requirements that appear as notes on general note pages, not on elevation drawings.

**⚠️ CRITICAL:** F1–F6 filler/panel pieces are FREQUENTLY excluded from INNERGY takeoffs. Also verify DieWall panels and other non-standard casework pieces.

**Note on markers:** The completeness_check script scans for marker strings in PDF text. Results are approximate — use vision analysis (Step 4) for accurate counts. The marker string "B1" in drawings refers to rubber base material, NOT a cabinet variant.

Save to `completeness_report.md`.

**Context check:** If >70% full, compact before proceeding.

**⏸️ Gate:**
- **[C] Continue** → Verify `drawing_requirements_checklist.md` has been reviewed against INNERGY scope. Every item in the checklist must have a ✅ or ❌ status. Proceed to Step 7.
- **[R] Show Results** → Display all completeness issues found + checklist review status
- **[S] Stop** → Save state, end analysis

---

### Step 7 — Millwork Company Output Review

*Skip this step if no separate millwork company quote/proposal was provided.*

Compare the millwork company's output (quote, proposal, or alternate bid) against the same drawing baseline:

1. Extract their line items (same as Step 5 if their format allows)
2. Compare cabinet counts and types per suite to the drawing findings
3. Identify items they captured that INNERGY missed, and vice versa
4. Flag any systematic differences in dimension approach

Save to `millwork_company_review.md`.

**Context check:** If >70% full, compact before proceeding.

**⏸️ Gate:**
- **[C] Continue** → Check context → Proceed to Step 8
- **[R] Show Results** → Display comparison findings
- **[S] Stop** → Save state, end analysis

---

### Step 8 — Review Documents

**Required inputs before starting:**
1. `innergy_qc.xlsx` — Step 5 output
2. `completeness_report.md` — Step 6 output
3. **`drawing_requirements_checklist.md` — Phase 3C output** ⬅️ **CRITICAL — must be completed before Step 8**
4. `innergy_qc_colorcoded.xlsx` — from Step 8A

**A. Color-coded QC Spreadsheet**
- Every INNERGY line item with drawing verification status:
  - ✅ CONFIRMED — dimensions and quantity match drawing
  - 🔴 DISCREPANCY — dimension or quantity variance found
  - ⚠️ NEEDS REVIEW — could not verify, needs field confirmation
  - ❌ MISSING — in drawing but not in INNERGY

**Two-step process:**

```bash
# Step 1: Build comparison file from INNERGY xlsx
python3 scripts/build_comparison.py \
  --input "path/to/INNERGY_bid.xlsx" \
  --output "path/to/analysis/innergy_qc.xlsx"

# Step 2: Populate OC columns with drawing dimensions and color-code (single output file)
python3 scripts/populate_oc_columns.py \
  --input "path/to/analysis/innergy_qc.xlsx" \
  --output "path/to/analysis/innergy_qc.xlsx"
```

Final columns: Line #, Name, Location, Origin, X, Y, Z, Qty, OC X, OC Y, OC Z
(No OC Qty column — quantity is always 1 per line, no comparison needed)

**Color coding:**
- 🟢 GREEN = INNERGY matches drawing
- 🔴 RED = INNERGY differs from drawing (known discrepancy)
- ⬜ GREY = No physical dimensions (Add.Hours, DieWall, coat rod) or Z-depth not shown in elevation
- OC columns: OC X, OC Y, OC Z (no OC Qty — qty is always 1 per line)

**B. Layered Annotated PDF** (per discrepancy type)

⚠️ **Coordinates are auto-detected from the PDF — use `--issue` flag instead of manual `--lasso`.**

Run the script for each discrepancy type using the `--issue` flag:

```bash
# Floating shelf mislabel — auto-detects F6 marker on Suite 1300 page
python3 scripts/annotate_pdf.py \
  --input "path/to/drawings_extracted.pdf" \
  --output "path/to/analysis/DISCREPANCY_REVIEW_[project]_floating_shelf.pdf" \
  --pages "2" \
  --title "Floating Shelf Mislabel" \
  --discrepancy "10 items labeled Floating Shelf PL have Y=25 (countertop depth)|Standard floating shelf depth = Y=12|Reclassify as PL Top or Solid Surface" \
  --issue floating_shelf
```

**Supported `--issue` types:**
| Issue | Page | Searches for | Notes |
|-------|------|-------------|-------|
| `floating_shelf` | 2 (Suite 1300) | F6 marker | Floating shelf locations |
| `base_cabinet` | 0 (Suite 1150) | 34" MAX | Base cabinet height callout |
| `trash_cabinet` | 0 | T marker | Trash/recycle cabinet area |

**Manual coordinates (override):** Use `--lasso x1,y1,x2,y2` instead of `--issue` if you have exact coordinates from a PDF viewer.

**To find coordinates for a new issue type:**
```bash
python3 scripts/find_annotation_coords.py \
  --pdf path/to/drawings_extracted.pdf \
  --page 2 \
  --search "F6"
```
Outputs: `x1,y1,x2,y2` — use these with `--lasso`.

**Output:** One PDF per discrepancy, with OCG toggle layers.
- **Lasso layer** (red dashed box): marks the discrepancy area on the drawing
- **Comments layer** (blue box): contains the annotation text

Open in FoxIt PDF Reader → press F5 → toggle layers on/off.

Naming: `DISCREPANCY_REVIEW_[ProjectName]_[issue].pdf`
Example: `DISCREPANCY_REVIEW_595_Market_Street_floating_shelf_mislabel.pdf`

**C. Executive Summary**
- High-level overview: total line items, confirmed count, discrepancy count, missing count
- Critical items requiring immediate action
- Items flagged for review
- Recommended next steps

Output: `ESTIMATE_REVIEW_[ProjectName]_[date].md`
Example: `ESTIMATE_REVIEW_595_Market_Street_2026-03-24.md`

**Context check:** Always compact before final output generation if >50% full.

**⏸️ Gate:**
- **[C] Continue** → Finalize all documents, deliver to analysis folder
- **[R] Show Results** → Preview spreadsheet and PDF annotations
- **[S] Stop** → Hold deliverables for further review

---

## Scripts

### scripts/build_comparison.py
Builds the initial QC comparison spreadsheet from the raw INNERGY bid xlsx. Extracts all line items with Name, Location (with SUITE info), Origin/SKU, X, Y, Z, Qty — plus empty OC columns ready for population.
```
python3 scripts/build_comparison.py \
  --input path/to/INNERGY_bid.xlsx \
  --output path/to/analysis/innergy_qc_comparison.xlsx
```
**⚠️ IMPORTANT:** The INNERGY Budget Data sheet has Location in column 10 (not column 3). This script correctly reads from column 10 to capture SUITE numbers. Requirements: openpyxl

### scripts/populate_oc_columns.py
Populates the OC (OpenClaw/Drawing) columns with drawing-extracted dimensions and applies color coding. Uses verified discrepancy rules:

| Rule | OC Value | Color |
|------|----------|-------|
| Floating shelf Y=25 (mislabeled) | OC_Y=12, OC_Z=12 | OC_Y=RED, OC_Z=GREEN |
| Floating shelf Y=12 (correct) | OC_Y=12, OC_Z=12 | GREEN |
| Base cabinet | OC_Y=34 | GREEN (INNERGY ~32.52 = expected tolerance) |
| Wall cabinet Suite 1300 | OC_Y=38 | RED (INNERGY ~36) |
| Tall cabinet | OC_Y=90 | GREEN (INNERGY ~90) |
| All other items | OC = INNERGY value | GREEN (no known discrepancy) |

```
python3 scripts/populate_oc_columns.py \
  --input path/to/analysis/innergy_qc_comparison.xlsx \
  --output path/to/analysis/innergy_qc_comparison_filled.xlsx
```
Requirements: openpyxl

### scripts/modify_spreadsheet.py
Reads INNERGY xlsx → extracts all line items with X/Y/Z/qty/suite → outputs clean xlsx for QC.
```
python3 scripts/modify_spreadsheet.py \
  --input path/to/input.xlsx \
  --output path/to/output.xlsx
```
Requirements: openpyxl

### scripts/completeness_check.py
Compares drawing cabinet counts against INNERGY line item counts. Identifies mislabeled items, missing cabinets, B1/F6 variants, extra items, scope LF discrepancies.
```
python3 scripts/completeness_check.py \
  --drawing path/to/drawings.pdf \
  --innergy path/to/innergy_qc.xlsx \
  --output path/to/completeness_report.md
```
Requirements: PyMuPDF (fitz), openpyxl

### scripts/annotate_pdf.py
Creates OCG-layered annotated PDFs from source drawings. Supports auto-coordinate detection via `--issue` flag.
```
# Auto-detect coordinates
python3 scripts/annotate_pdf.py \
  --input path/to/drawings.pdf \
  --output path/to/output.pdf \
  --pages 2 \
  --discrepancy "Line 1|Line 2|Action" \
  --title "Discrepancy title" \
  --issue floating_shelf

# Manual coordinates
python3 scripts/annotate_pdf.py \
  --input path/to/drawings.pdf \
  --output path/to/output.pdf \
  --pages 2 \
  --discrepancy "Line 1|Line 2|Action" \
  --title "Discrepancy title" \
  --lasso "x1,y1,x2,y2"
```
Requirements: PyMuPDF (fitz)

### scripts/find_annotation_coords.py
Finds bounding-box coordinates of markers/text on a PDF page for use with `--lasso`.
```
python3 scripts/find_annotation_coords.py \
  --pdf path/to/drawings.pdf \
  --page 2 \
  --issue floating_shelf

python3 scripts/find_annotation_coords.py \
  --pdf path/to/drawings.pdf \
  --page 2 \
  --search "F6"
```
Requirements: PyMuPDF (fitz)

### scripts/identify_coords.py
Renders a PDF page as a PNG for manual coordinate finding (image viewer required).
```
python3 scripts/identify_coords.py \
  --input path/to/drawings.pdf \
  --output coords.png \
  --page 2
```

---

## Common Discrepancy Patterns

| Pattern | Likely Cause | Action |
|---------|-------------|--------|
| Drawing has base cabs INNERGY doesn't | Cabinets missed in takeoff | Add line items to InnerGy |
| INNERGY has items not in drawing | Scope item not shown in drawings | Verify with GC/architect |
| **Floating Shelf PL with Y=25** | Countertop miscategorized as shelf | Reclassify as PL Top — Y=25 is countertop depth |
| Scope LF >> actual cabinet widths | Budgeted vs drawn footage | Note variance in bid |
| Missing tall cabs in drawing | Tall cabs in spec but not shown in elevation | Confirm with InnerGy team |
| F1-F6 filler/panels in drawing but no corresponding INNERGY items | Fillers/panels often excluded from takeoff | Flag for review; verify scope includes casework panels |

---

## Project Structure

```
~/Desktop/Projects/
  001_ProjectName/
    001_project_name_input/
      source_drawing.pdf
      INNERGY_estimating.xlsx
      scope_of_work.pdf
      [other customer supplied files]
    002_project_name_analysis/
      drawings_extracted.pdf        # Step 3 output — confirmed millwork pages extracted from source PDF
      innergy_qc.xlsx                              # Final comparison (OC cols populated, color-coded)
      innergy_qc_colorcoded.xlsx                  # Color-coded QC spreadsheet
      completeness_report.md                       # Completeness check output
      scope_summary.md                             # Scope extraction output
      millwork_company_review.md                    # Millwork company comparison (if applicable)
      EXECUTIVE_SUMMARY.md                        # Executive summary — for estimator review
      DISCREPANCY_REVIEW_[ProjectName]_[issue].pdf # Layered annotated PDFs per discrepancy
      ESTIMATE_REVIEW_[ProjectName]_[date].md      # Legacy executive summary naming
  scratch/
    file_audit.md                  # Step 1 output
    drawing_pages_extracted.md     # Step 3 output
    findings_[suite].md            # Step 4 per-suite findings
```

---

## Context Window Management

- **Every gate checks context** — if >70% full, auto-summarize and compact before continuing (no prompt needed)
- **Per-suite Step 4 gates** — context check between each suite to prevent token overflow on large projects
- **Compact on final Step 8** — if >50% full before generating deliverables, compact first
- **Save state on [S] Stop** — all findings up to that point are preserved in `scratch/` or analysis folder

---

## Tips

- **Extract dimension strings before interpreting them:** Use `fitz` to extract ALL dimension callouts (strings with `'` or `"`) with their x,y positions. Sort by y then x to see the vertical stacking. Then manually map each to what it labels. Never assume a dimension annotates the nearest cabinet without checking context.
- **Dimension strings vary by drawing:** The same annotation style can mean different things on different projects. A "1'-8"" could be a wall cabinet height, a shelf spacing, or a filler width. Always extract and verify on each project.
- **Verify cabinet heights from callouts:** Don't assume base = 34", wall = 36", or tall = 90" across all projects. Extract the actual dimension strings and confirm from the drawing's own callouts.
- **Floating shelf mislabel detection:** Standard floating shelf depth = 12". Countertop depth = 25". On elevations where Y or Z = 25" and labeled "Floating Shelf PL", it's a mislabeled countertop. Verify with dimension extraction first.
- **Base cabinet height:** Standard is 34" to top of base. INNERGY often uses 32.52" (34" minus ~1.48" manufacturing tolerance). This is a known systematic difference — not necessarily an error.
- **DieWall items:** Usually floor-to-ceiling panels. Verify height from drawings before flagging as discrepancy.
- **ST3 = backsplash tile, NOT a wall cabinet.** B1/B2 = rubber base material, NOT cabinet variants. P1 = paint finish, NOT a cabinet. Always verify what a marker actually means before counting it.
- **T/R/C are features within cabinets:** Trash, Recycle, Compost designations appear inside base cabinet runs — they are not separate cabinet types.
- **F1-F6 filler/panel markers:** These ARE cabinet fragments and ARE frequently missed in INNERGY takeoffs. Count them carefully with vision.
- **Scope from customer docs only:** Never use the millwork company's proposal or bid as the scope source. Their bid is the output you're verifying against.
- **Two-phase drawing reduction (Step 3):** Text filter first to narrow candidates, vision to confirm each page is actually a millwork elevation before extracting.