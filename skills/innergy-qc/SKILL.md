# innergy-qc — Millwork Estimating QC Workflow

Verifies that the millwork company bid (INNERGY output) accurately reflects the customer's scope and the architectural drawings. Compares customer inputs → scope → drawings → INNERGY → review documents.

**Input:** Customer-supplied files (specs, drawings, millwork company bid/INNERGY spreadsheet, optional: millwork company quote)
**Output:** Scope summary, color-coded QC spreadsheet, layered annotated PDFs, executive summary

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
  --pages "1,5,6,25,26,27,28,45,46,56"
```

Save extracted page list to `scratch/drawing_pages_extracted.md`.

**Context check:** If >70% full, compact before proceeding.

**⏸️ Gate:**
- **[C] Continue** → Check context → Proceed to Step 4
- **[R] Show Results** → Show original page count vs. extracted count, list included pages
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

**For each suite, record:**
- Suite name and floor
- Cabinet sections by type (base runs, upper runs, islands)
- Width of each distinct section (from dimensions on drawing)
- Special items: trash pull-outs, coat rods, solid surface, floating shelves
- Base height: 34" MAX standard
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

**⚠️ CRITICAL:** F1–F6 filler/panel pieces are FREQUENTLY excluded from INNERGY takeoffs. Also verify DieWall panels and other non-standard casework pieces.

**Note on markers:** The completeness_check script scans for marker strings in PDF text. Results are approximate — use vision analysis (Step 4) for accurate counts. The marker string "B1" in drawings refers to rubber base material, NOT a cabinet variant.

Save to `completeness_report.md`.

**Context check:** If >70% full, compact before proceeding.

**⏸️ Gate:**
- **[C] Continue** → Check context → Proceed to Step 7
- **[R] Show Results** → Display all completeness issues found
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

Generate the final QC deliverables:

**A. Color-coded QC Spreadsheet**
- Every INNERGY line item with drawing verification status:
  - ✅ CONFIRMED — dimensions and quantity match drawing
  - 🔴 DISCREPANCY — dimension or quantity variance found
  - ⚠️ NEEDS REVIEW — could not verify, needs field confirmation
  - ❌ MISSING — in drawing but not in INNERGY

```bash
python3 scripts/populate_qc_xlsx.py
```

**B. Layered Annotated PDF** (per discrepancy type)

⚠️ **REQUIRED: Every discrepancy PDF must use the annotate_pdf.py script with real lasso coordinates.**

1. Identify the exact pixel coordinates of the discrepancy on the drawing page:
   - Use `identify_coords.py` (see below) or a PDF viewer to get coordinates
   - Lasso marks the exact area on the drawing; Comments box holds the annotation text
2. Run the script for each discrepancy:

```bash
python3 scripts/annotate_pdf.py \
  --input "path/to/drawings_extracted.pdf" \
  --output "path/to/analysis/DISCREPANCY_REVIEW_[project_name]_[issue].pdf" \
  --pages "0,1,2" \
  --title "Description of discrepancy" \
  --discrepancy "Line 1 of finding|Line 2|Action required" \
  --lasso "x1,y1,x2,y2"
```

**Arguments:**
- `--pages`: Comma-separated 0-indexed page numbers (0 = first page)
- `--title`: Brief title for the comment box header
- `--discrepancy`: Description text (separate lines with `|`)
- `--lasso`: REQUIRED — bounding box of the discrepancy area in points (from page origin, top-left = 0,0)

**To find coordinates:** Open the extracted PDF in FoxIt/Adobe, hover over the discrepancy area, note the X,Y position from the status bar.

**Example:**
```bash
python3 scripts/annotate_pdf.py \
  --input "002_analysis/drawings_extracted.pdf" \
  --output "002_analysis/DISCREPANCY_REVIEW_595_Market_floating_shelf_mislabel.pdf" \
  --pages "2" \
  --title "Floating Shelf Mislabel" \
  --discrepancy "18 items labeled Floating Shelf PL have Z=25 (countertop depth)|Standard floating shelf depth = Z=12|Reclassify as PL Top or Solid Surface" \
  --lasso "100,100,700,500"
```

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
**Drawing markers detected (text scan):** PL1, PL2, SS1, SS2, F1–F6 (plus P1, ST3, B1, B2 which appear in drawings but are materials not cabinets — verify with vision before counting)
Requirements: PyMuPDF (fitz), openpyxl

### scripts/populate_qc_xlsx.py
Populates the QC spreadsheet with verification findings. Reads from `scratch/findings_*.md` files.
Requirements: openpyxl

### scripts/annotate_pdf.py
Creates OCG-layered annotated PDFs from source drawings.
```
python3 scripts/annotate_pdf.py \
  --input path/to/drawings.pdf \
  --output path/to/output.pdf \
  --pages 1,2,3 \
  --discrepancy "Description of discrepancy" \
  --lasso "x1,y1,x2,y2"
```
Requirements: PyMuPDF (fitz)

---

## Common Discrepancy Patterns

| Pattern | Likely Cause | Action |
|---------|-------------|--------|
| Drawing has base cabs INNERGY doesn't | Cabinets missed in takeoff | Add line items to InnerGy |
| INNERGY has items not in drawing | Scope item not shown in drawings | Verify with GC/architect |
| **Floating Shelf PL with Z=25** | Countertop miscategorized as shelf | Reclassify as PL Top — Z=25 is countertop depth |
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
      innergy_qc.xlsx                        # Extracted INNERGY line items
      completeness_report.md                 # Completeness check output
      scope_summary.md                       # Scope extraction output
      millwork_company_review.md              # Millwork company comparison (if applicable)
      DISCREPANCY_REVIEW_[ProjectName]_[issue].pdf  # Layered annotated PDFs per discrepancy
      ESTIMATE_REVIEW_[ProjectName]_[date].md       # Executive summary — for estimator review
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

- **Always use vision for cabinet counting:** Text-based regex counting is fast but inaccurate. It counts every occurrence of a marker string — including schedule entries, legends, and material callouts that aren't actual cabinets. Use vision to get accurate counts.
- **Counter depth vs shelf depth:** Floating shelves are typically 12" deep. Countertops are typically 25" deep. **Check Z dimension** (depth): Z=25" = countertop mislabeled as floating shelf. Do NOT check Y.
- **Cabinet dimension axes:** X = width (face), Y = length (piece length), Z = depth (front-to-back). The mislabeled shelf rule uses **Z only**.
- **Reference examples from 595 Market Street:**
  - ✅ Correct floating shelf: `X=6.29" Y=75.44" Z=12"` — floating shelf depth confirmed
  - 🔴 Mislabeled floating shelf: `X=7.62" Y=91.49" Z=25"` — countertop depth (Z=25), reclassify as PL Top
- **Base cabinet height:** Standard is 34" to top of base. INNERGY often uses 32.52" (34" minus 1.48"). Flag as systematic discrepancy if present across all base cabinets.
- **Wall cabinet height:** Look at the elevation drawing's finished floor line and counter height callout.
- **DieWall items:** Usually floor-to-ceiling panels. Verify height from drawings before flagging as discrepancy.
- **ST3 = backsplash tile, NOT a wall cabinet.** B1/B2 = rubber base material, NOT cabinet variants. P1 = paint finish, NOT a cabinet. Always verify what a marker actually means before counting it.
- **T/R/C are features within cabinets:** Trash, Recycle, Compost designations appear inside base cabinet runs — they are not separate cabinet types.
- **F1-F6 filler/panel markers:** These ARE cabinet fragments and ARE frequently missed in INNERGY takeoffs. Count them carefully with vision.
- **Scope from customer docs only:** Never use the millwork company's proposal or bid as the scope source. Their bid is the output you're verifying against.
- **Two-phase drawing reduction (Step 3):** Text filter first to narrow candidates, vision to confirm each page is actually a millwork elevation before extracting.