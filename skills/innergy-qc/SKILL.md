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

Scan all files in `001_*_input/`. For each file, record:
- File name and type
- Brief description of what it contains (spec, drawing, bid, proposal, etc.)
- Page count (if PDF) or row count (if spreadsheet)
- Any initial observations about scope or notable items

Save findings to `scratch/file_audit.md`.

**Context check:** Before proceeding, check session context. If >70% full, summarize and compact first.

**⏸️ Gate:**
- **[C] Continue** → Check context → Proceed to Step 2
- **[R] Show Results** → Display full file audit
- **[S] Stop** → Save state, end analysis

---

### Step 2 — Scope Extraction

Read the scope documentation (specs, proposals, SOW, scope letters). Extract:
- Project name and customer
- Suites / areas included
- Authorized linear footage (LF) per suite
- Cabinet types specified (base, wall, tall, floating shelf, etc.)
- Special items (solid surface, DieWall, fillers, etc.)
- Exclusions or items noted as "by others"
- Any budget or pricing notes

Save to `scope_summary.md` in `002_*_analysis/`.

**Context check:** If >70% full, compact before proceeding.

**⏸️ Gate:**
- **[C] Continue** → Check context → Proceed to Step 3
- **[R] Show Results** → Display scope summary
- **[S] Stop** → Save state, end analysis

---

### Step 3 — Drawing Reduction

Large drawing sets often contain structural, electrical, HVAC, and other non-millwork pages. Identify and extract only the millwork-relevant pages:

1. Scan PDF for A401, A102, millwork-related sheet numbers
2. Note which pages contain elevation drawings (where cabinet markers appear)
3. Extract those pages to a working PDF: `drawings_extracted.pdf`

Save extracted page list to `scratch/drawing_pages_extracted.md`.

**Context check:** If >70% full, compact before proceeding.

**⏸️ Gate:**
- **[C] Continue** → Check context → Proceed to Step 4
- **[R] Show Results** → Show original page count vs. extracted count, list included pages
- **[S] Stop** → Save state, end analysis

---

### Step 4 — Drawing Capture (Per Suite)

For each suite identified in the scope:

1. Read the elevation drawings for that suite
2. Identify and count all cabinet markers:
   - `P1` = base cabinet (standard)
   - `PL1/PL2` = plastic laminate cabinet type
   - `SS1/SS2` = solid surface
   - `ST3` = small wall cabinet
   - `B1, B2, etc.` = base cabinet VARIANTS
   - `F1–F6` = filler/panel pieces
3. Record dimensions for each cabinet type (X, Y, Z)
4. Note special features: toe kicks, scribe panels, DieWall, brackets
5. Compare marker count to stated LF — flag discrepancies

Save per-suite findings to `scratch/findings_[suite].md`.

**Drawing marker dimensions reference:**
- Base cabinet height: 34" (to top of base)
- Standard countertop height: 36" AFF
- Wall cabinet height: 30–38" AFF depending on counter height
- Floating shelf depth: 12"
- Counter depth: 25"
- Mislabeled shelf indicator: floating shelf with X > 90" AND Y > 20" → likely PL Top / Countertop

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
3. **B1 base variants** — drawing shows B1/B2 markers but no corresponding variant line items in INNERGY
4. **F1–F6 filler/panels** — drawing shows F-markers but no corresponding INNERGY items
5. **Extra items** — INNERGY has line items with no drawing evidence
6. **Tall cabinets** — scope authorizes 90" tall cabinets but drawings may not show them clearly
7. **Scope LF** — stated LF vs. sum of cabinet face widths

**⚠️ CRITICAL:** B1 variants and F1–F6 filler/panel markers are FREQUENTLY excluded from INNERGY takeoffs — even when the operation codes exist in the Pricing Engine. Always verify these specifically.

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

```bash
python3 scripts/annotate_pdf.py \
  --input "path/to/drawings_extracted.pdf" \
  --output "path/to/analysis/annotated_[issue].pdf" \
  --pages 1 \
  --discrepancy "Description of issue" \
  --lasso "x1,y1,x2,y2"
```

OCG layers can be toggled in FoxIt PDF Reader (F5 → Layers tab).

**C. Executive Summary**
- High-level overview: total line items, confirmed count, discrepancy count, missing count
- Critical items requiring immediate action
- Items flagged for review
- Recommended next steps

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
**Drawing markers detected:** P1, PL1, PL2, SS1, SS2, ST3, B1, B2, F1–F6
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
| Mislabeled floating shelf X>90 Y>20 | Countertop miscategorized | Reclassify as PL Top |
| Scope LF >> actual cabinet widths | Budgeted vs drawn footage | Note variance in bid |
| Missing tall cabs in drawing | Tall cabs in spec but not shown in elevation | Confirm with InnerGy team |
| B1 base variants in drawing but no B1 line items in INNERGY | B1 variants missed in takeoff — operation codes exist but not used | Flag for review; these may need separate line items |
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
      innergy_qc.xlsx              # Extracted INNERGY line items
      completeness_report.md       # Completeness check output
      scope_summary.md             # Scope extraction output
      millwork_company_review.md   # Millwork company comparison (if applicable)
      annotated_[issue].pdf        # Layered annotated PDFs per discrepancy
      qc_report_[date].md          # Executive summary
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

- **Counter depth vs shelf depth:** Floating shelves are typically 12" deep. Countertops are typically 25" deep. If INNERGY shows Y=25" for a floating shelf, it's likely mislabeled.
- **Base cabinet height:** Standard is 34" to top of base. INNERGY often uses 32.52" (34" minus 1.48"). Flag as systematic discrepancy if present across all base cabinets.
- **Wall cabinet height:** Look at the elevation drawing's finished floor line and counter height callout.
- **DieWall items:** Usually floor-to-ceiling panels. Verify height from drawings before flagging as discrepancy.
- **B1 base variants:** If you see B1, B2 markers in the drawing, DO NOT assume they're covered by standard P1 items. Check INNERGY line items specifically for B1 variant pricing.
- **F1-F6 filler/panel markers:** Easy to miss. If drawing shows F-markers and INNERGY has no panel/filler items, flag it.
- **Operation codes exist ≠ included in bid:** The Pricing Engine may have the right code but it wasn't used in the takeoff. Always verify against drawing marker count.
