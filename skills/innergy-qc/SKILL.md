# innergy-qc — Millwork Estimating QC Workflow

Compares INNERGY estimating spreadsheets against architectural drawing PDFs to identify discrepancies in dimensions, quantities, and completeness.

**Input:** PDF drawings + INNERGY spreadsheet  
**Output:** Color-coded QC spreadsheet + annotated PDF callouts

---

## Workflow

### Phase 1: Project Setup

When files appear in `~/Desktop/Incoming_Projects/`:

1. Read the files and identify the project
2. Create a numbered project folder:
   ```
   ~/Desktop/Projects/001_ProjectName/
     001_project_name_input/
     002_project_name_analysis/
   ```
3. Copy original files to `001_*_input/` — never modify originals
4. Extract the full project name, customer, and drawing page count

### Phase 2: Extract INNERGY Spreadsheet

Use `scripts/modify_spreadsheet.py` to extract data from the INNERGY xlsx:

```bash
python3 scripts/modify_spreadsheet.py \
  --input "path/to/INNERGY.xlsx" \
  --output "path/to/analysis/innergy_qc.xlsx"
```

This creates an xlsx with:
- All line items with X, Y, Z dimensions and quantities
- Suite/location information
- Budget pricing chain (if present)

If the xlsx already exists and you're re-running, skip this step.

### Phase 3: Extract Drawing Pages

If the source PDF is large (>20 pages), extract only relevant pages:

```bash
python3 scripts/extract_pages.py \
  --input "path/to/source_drawing.pdf" \
  --output "path/to/analysis/drawings_extracted.pdf" \
  --pages 1,5,6,25,26,27,28,45,46,56
```

Otherwise use the full PDF directly.

### Phase 4: Analyze Drawings Per Suite

For each suite/area in the project:

1. Read the elevation drawings (A401 sheets)
2. Identify cabinet types and count each type per suite
3. Record dimensions for each cabinet type
4. Note any features: toe kicks, scribe panels, special configurations
5. Save findings to `scratch/findings_[suite].md`

**Drawing markers to look for:**
- P1 = base cabinet
- PL1/PL2 = plastic laminate cabinet type
- SS1/SS2 = solid surface
- ST3 = small wall cabinet
- DIM indicators (e.g. 2'-10" = 34")

**Typical dimensions:**
- Base cabinet height: 34" (to top of base)
- Standard countertop height: 36" AFF
- Wall cabinet height: 30-38" AFF
- Floating shelf depth: 12"
- Counter depth: 25"

### Phase 4b: Completeness Check (REQUIRED)

**⚠️ Run this BEFORE creating the QC spreadsheet. It changes what goes into the spreadsheet.**

```bash
python3 scripts/completeness_check.py \
    --drawing path/to/source_drawing.pdf \
    --innergy path/to/innergy_qc.xlsx \
    --output path/to/completeness_report.md
```

**What it checks:**
1. **Mislabeled items:** Floating shelf X > 90" AND Y > 20" → almost certainly a PL Top / Countertop mislabeled as a floating shelf
2. **Missing cabinets:** Drawing shows cabinets that have no corresponding line item in INNERGY
3. **Extra items:** INNERGY has line items with no supporting drawing evidence
4. **Tall cabinets:** Scope authorizes 90" tall cabinets but drawings may not show them clearly — verify
5. **Scope LF:** Stated linear footage vs. sum of cabinet face widths

**Update the QC spreadsheet notes** with completeness findings before finalizing.

### Phase 5: Create Clean QC Spreadsheet

**⚠️ MANDATORY: Verify every dimension and quantity.**

The goal is to check ALL INNERGY line items against the drawings — every X, Y, Z dimension and every quantity. Do not skip any item.

1. **Dimension check:** For every INNERGY line item, verify X, Y, Z against the drawing. Flag any variance > 0.5".

2. **Quantity check:** For every INNERGY line item, verify quantity (count of cabinets, shelves, etc.) against the drawing count.

3. **Completeness check (REQUIRED):** Run `completeness_check.py` BEFORE the spreadsheet. This checks:
   - Mislabeled items (countertops as floating shelves, etc.)
   - Missing cabinets in INNERGY (cabinets in drawing but no line item)
   - Extra items in INNERGY (line items with no drawing evidence)
   - Scope LF vs actual cabinet face widths
   - Tall cabinet existence (scope authorizes 90" tall cabinets, but do drawings show them?)

4. **Scope check:** Verify the stated LF in the drawing scope matches what INNERGY totaled. INNERGY LF = sum of cabinet face widths, not linear wall footage.

Use `scripts/populate_qc_xlsx.py` to fill the spreadsheet:

```bash
python3 scripts/populate_qc_xlsx.py
```

The output is a new xlsx file (innergy_qc.xlsx) — the original INNERGY file is never modified.

### Phase 6: Annotated PDFs

For key discrepancies, create OCG-layered annotated PDFs:

```bash
python3 scripts/annotate_pdf.py \
    --input "path/to/drawings_extracted.pdf" \
    --output "path/to/analysis/annotated_suite1150.pdf" \
    --pages 1 \
    --discrepancy "Base cabinet height: drawing 34in vs INNERGY 32.52in"
```

OCG layers can be toggled in FoxIt PDF Reader (F5 → Layers tab).

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

Compares drawing cabinet counts against INNERGY line item counts. Identifies mislabeled items, missing cabinets, extra items, and scope LF discrepancies.

```
python3 scripts/completeness_check.py \
    --drawing path/to/source_drawing.pdf \
    --innergy path/to/innergy_qc.xlsx \
    --output path/to/completeness_report.md
```

**Drawing markers detected:** P1, PL1, PL2, SS1, SS2, ST3, B1, F1-F6 (base, wall, tall, shelf, filler types)

**Output:** Markdown report with mislabeled items table, drawing marker counts per suite, INNERGY item counts per suite, and completeness assessment questions.

Requirements: PyMuPDF (fitz), openpyxl

### scripts/populate_qc_xlsx.py

Populates the QC spreadsheet with OpenClaw dimension findings. Reads from `scratch/findings_*.md` files.

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

---

## Project Structure

```
~/Desktop/Projects/
  001_ProjectName/
    001_project_name_input/
      source_drawing.pdf
      INNERGY_estimating.xlsx
      scope_of_work.pdf
    002_project_name_analysis/
      innergy_qc.xlsx              # QC spreadsheet
      completeness_report.md         # Completeness check output
      annotated_*.pdf               # Annotated PDFs
  scratch/                         # Working files
    findings_suite1150.md
    findings_suite1200.md
```

---

## Tips

- **Counter depth vs shelf depth:** Floating shelves are typically 12" deep. Countertops are typically 25" deep. If INNERGY shows Y=25" for a floating shelf, it's likely mislabeled.
- **Base cabinet height:** Standard is 34" to top of base. INNERGY often uses 32.52" (34" minus 1.48"). Flag this as a systematic discrepancy if present across all base cabinets.
- **Wall cabinet height:** Depends on counter height and whether it's an upper or lower wall cab. Look at the elevation drawing's finished floor line and counter height callout.
- **DieWall items:** Usually floor-to-ceiling panels. Verify height from drawings before flagging as discrepancy.
