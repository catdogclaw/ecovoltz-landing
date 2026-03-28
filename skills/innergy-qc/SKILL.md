# innergy-qc — Millwork Estimating QC Workflow

Verifies that the millwork company bid (INNERGY output) accurately reflects the customer's scope and the architectural drawings. Compares customer inputs → scope → drawings → INNERGY → review documents.

**Input:** Customer-supplied files (specs, drawings, millwork company bid/INNERGY spreadsheet, optional: millwork company quote)
**Output:** Scope summary, color-coded QC spreadsheet, layered annotated PDFs, executive summary

---

## Core Principles

**Verify from primary source, not prior runs.** Each project run must verify dimensions directly from the drawing PDFs — do not assume prior-run findings about cabinet heights, widths, or marker meanings are correct without confirming them on the current drawings. Drawing conventions vary by project.

**Extract dimension strings before interpreting them.** Never infer what a dimension string means without seeing its position and context on the drawing. Extract all labeled dimensions first, map them to what they annotate, then build rules.

**LLM preprocessing replaces manual drawing reduction.** Use Claude for page identification and detailed analysis. Claude's per-page enumeration and conflict detection is superior to manual text filtering.

**Flag uncertainty explicitly.** When inferring meaning (e.g., "this label must be the wall cabinet height"), state the inference and reasoning. Do not present inferences as facts.

---

## Project Setup (PREP)

When files appear in `~/Desktop/Incoming_Projects/`:

1. Create a numbered project folder:
   ```
   ~/Desktop/Projects/001_ProjectName/
     001_input/
     002_LLM_analysis/
     003_extract/
     004_comparison/
     005_deliverables/
   ```
2. Copy ALL original files to `001_input/` — never modify originals
3. Note: project sub-revisions use suffix (A, B, C): `006A_`, `006B_`, etc.

---

## PREPROCESSING — LLM-DRIVEN

### Step 1 — File Audit & PDF Preparation

**Phase 1A — Quick File Scan:**
- Scan every file with PyMuPDF (PDF) or openpyxl (spreadsheet)
- Record: filename, type, page/sheet count, size
- Identify file types: architectural drawing, spec, proposal, bid spreadsheet, scope doc

**Phase 1B — PDF Readiness Check:**
- If PDF >100 pages: note that splitting is needed for Claude (100-page limit)
- If PDF >30MB: note that compression is needed before LLM upload
- Determine if PDF is image-based (no text layer) — requires vision-capable LLM

Save findings to `scratch/file_audit.md`.

**⏸️ Gate:**
- **[C] Continue** → Proceed to Step 2
- **[S] Stop** → Save state, end analysis

---

### Step 2 — LLM Page Identification

**Purpose:** Identify every millwork-relevant page in the drawing set. Claude does this faster and more accurately than text filtering.

**Claude Constraints:**
- Maximum 100 pages per upload
- Maximum file size ~30MB per upload
- If PDF exceeds either limit: split before upload, run on each part, combine results

**Action:**
1. Check: if compressed PDF >100 pages OR >30MB → split into parts
2. Create per-part prompt file in `002_LLM_analysis/` for each PDF part:
   - PART1 → `page_identification_PART1.md` with output `llm_results_PART1.md`
   - PART2 → `page_identification_PART2.md` with output `llm_results_PART2.md`
   - (same pattern for additional parts)
   - Each prompt must end with: "Save your complete findings as an MD file with this exact filename: llm_results_PART[N].md"
3. Attach the PDF part and its prompt file to Claude
4. Claude executes autonomously and saves the output file automatically
5. Download the saved file from Claude's workspace
6. Move to `002_LLM_analysis/llm_results_PART[N].md`
7. Repeat for all parts
8. Combine all results into `llm_page_results.md`

**Output:** `llm_page_results.md` — combined list of millwork-relevant page numbers

**⏸️ Gate:** After Step 2 — you have page numbers. Proceed to Step 3 (extract). Do NOT create detailed analysis prompt until after Step 3.

---

### Step 3 — Full Resolution Page Extraction

**Purpose:** Extract only the millwork-relevant pages from the ORIGINAL full-resolution PDF.

**Action:**
1. Read `llm_page_results.md`
2. Extract those specific pages from original PDF at full resolution
3. Save as `full_resolution_pages.pdf`

**⚠️ Size check before upload:** If `full_resolution_pages.pdf` exceeds 100 pages OR 30MB:
- Split into parts (e.g., pages 1-40, 41-80, etc.)
- Upload each part separately to Claude
- Combine Claude outputs into `llm_detailed_results.md`

```python
import fitz
doc = fitz.open('original.pdf')
out = fitz.open()
for pg in page_list:  # from llm_page_results.md
    out.insert_pdf(doc, from_page=pg-1, to_page=pg-1)
out.save('full_resolution_pages.pdf')
```

**Output:** `full_resolution_pages.pdf` — full-resolution subset of millwork pages

---

### Step 4 — LLM Detailed Analysis

**Purpose:** Claude produces an exhaustive per-page inventory of material codes, cabinet counts, construction notes, and gaps. Only create the detailed analysis prompt AFTER getting page ID results and extracting full-res pages.

**Claude Constraints:**
- Maximum 100 pages per upload
- Maximum file size ~30MB per upload
- If `full_resolution_pages.pdf` exceeds either limit: split into parts, upload separately, combine results

**Action:**
1. Check size: if `full_resolution_pages.pdf` >100 pages OR >30MB → split into parts
2. Create `detailed_analysis.md` prompt in `002_LLM_analysis/` — tailor it based on the actual pages found (e.g., note which sheet numbers/types appear). Include this instruction at the end: "Save your complete findings as an MD file with this exact filename: llm_detailed_results.md"
3. Attach `full_resolution_pages.pdf` and `detailed_analysis.md` to Claude
4. Claude executes autonomously and saves as `llm_detailed_results.md`
5. Download and move to `002_LLM_analysis/`

**If split needed:** Run on each part, save each result as `llm_detailed_results_PART1.md`, etc. Combine into `llm_detailed_results.md` when all parts are done.

**Output:** `llm_detailed_results.md` — exhaustive per-page analysis

---

## ANALYSIS — INNERGY-DRIVEN

### Step 5 — Scope Extraction

**Purpose:** Establish what the customer authorized — this is the baseline for comparison.

**⚠️ IMPORTANT:** Scope comes from customer-supplied documents only. NOT from the millwork company's proposal, bid, or takeoffs. Those are what you're verifying against.

Extract from customer scope documents:
- Project name, customer, location
- Suites / areas explicitly in scope
- Authorized linear footage (LF) per suite — only what is stated in customer docs
- Cabinet types specified (base, wall, tall, floating shelf, etc.)
- Special items (solid surface, DieWall, fillers, etc.)
- Exclusions or "by others" items
- Drawing sheet references (A401, A102, etc.)

**If LF is not stated in customer docs:** Note this — LF must be calculated from drawings in Step 6.

Save to `scope_summary.md` in `003_extract/`.

**⏸️ Gate:**
- **[C] Continue** → Proceed to Step 6
- **[R] Show Results** → Display scope summary
- **[S] Stop** → Save state, end analysis

---

### Step 6 — Completeness Check

**Purpose:** Compare drawing findings against INNERGY line items. Claude's detailed analysis is the drawing baseline.

**Using Claude results:**
- `llm_detailed_results.md` → drawing material codes, cabinet counts, construction notes
- `llm_page_results.md` → confirmed millwork pages

**Phase 6A — Full Source Scan (complements Claude):**
Claude scanned the millwork-relevant pages. Also scan the FULL original PDF for millwork construction notes that may appear on non-millwork pages:
```
"PROVIDE" + cabinet, counter, vanity, shelf, panel, millwork, bracket, support, blocking, backing
"IN-WALL", "BRACKET", "BACKING", "BLOCKING"
"UNDERCOUNTER" + support/brackets
```
Save to `drawing_requirements_checklist.md`.

**Phase 6B — INNERGY Extraction:**
```bash
python3 scripts/modify_spreadsheet.py \
  --input "path/to/INNERGY.xlsx" \
  --output "003_extract/innergy_qc.xlsx"
```

**Phase 6C — Comparison:**
Run completeness check:
```bash
python3 scripts/completeness_check.py \
  --drawing "001_input/source_drawing.pdf" \
  --innergy "003_extract/innergy_qc.xlsx" \
  --output "004_comparison/completeness_report.md"
```

**Checks:**
1. **Mislabeled items** — floating shelf X > 90" AND Y > 20" → countertop miscategorized
2. **Missing cabinets** — cabinets in drawing with no INNERGY line item
3. **Missing F1-F6 filler/panel pieces** — frequently excluded from takeoffs
4. **Missing tall cabinets** — scope authorizes 90" but not shown in drawings
5. **Extra items** — INNERGY has items with no drawing evidence
6. **Dimension discrepancies** — drawing vs INNERGY dimensions
7. **Scope LF** — stated LF vs sum of cabinet face widths
8. **Drawing Requirements Checklist** — every note must have ✅, ❌, or ❓ status

**⚠️ DIMENSION VERIFICATION — Before flagging any discrepancy:**
> - X = width (horizontal face width)
> - Y = length (horizontal piece length)
> - Z = depth (front-to-back)
>
> Floating shelf depth = Z=12"
> Countertop depth = Z=25"
> A "Floating Shelf PL" with Z=25 is mislabeled — reclassify as PL Top.

Save to `completeness_report.md`.

**⏸️ Gate:**
- **[C] Continue** → Proceed to Step 6D (Scoring)
- **[R] Show Results** → Display completeness issues
- **[S] Stop** → Save state, end analysis

---

### Step 6D — QC Scoring

**Purpose:** Score the completed QC run against the rubric to track skill improvement over time. Target: 95%+ three times in a row before a skill version is "locked."

**Autoresearch rule:** Each time you run a QC job, increment the round number. Track: Round N → Score X% → what changed.

**Action:**
```bash
python3 scripts/score_qc_run.py \
  --completeness "004_comparison/completeness_report.md" \
  --xlsx "003_extract/innergy_qc.xlsx" \
  --output "004_comparison/qc_score.md" \
  --round N
```

**Scoring rubric (100 points total):**

| Section | Check | Points |
|---------|-------|--------|
| A1 | Cabinet X dimensions match INNERGY within 0.5" | 10 |
| A2 | Cabinet Y (height) dimensions match INNERGY within 0.5" | 10 |
| A3 | Cabinet Z (depth) dimensions match INNERGY within 0.5" | 10 |
| A4 | No systematic height discrepancies > 1" | 10 |
| B1 | No missing cabinets — every drawing cabinet has INNERGY item | 10 |
| B2 | No extra items — every INNERGY item has drawing evidence | 10 |
| B3 | No mislabeled items (countertops as floating shelves, etc.) | 10 |
| C1 | All PL-/SS-/WD-/AT- material codes matched | 10 |
| C2 | Finish schedule aligned | 10 |
| D1 | Cabinet counts match per suite | 5 |
| D2 | QTY field matches drawing count | 5 |

**Grade thresholds:**
- 95–100%: 🟢 Excellent
- 85–94%: 🟡 Good
- 70–84%: 🟠 Needs Work
- <70%: 🔴 Poor

**Output:** `qc_score.md` — scored report with failed items and autoresearch log entry

**⏸️ Gate:**
- **[C] Continue** → Proceed to Step 7
- **[R] Show Results** → Display score and failed items

---

### Step 7 — Millwork Company Output Review

*Skip if no separate millwork company quote/proposal was provided.*

Compare the millwork company's output against the same drawing baseline:
1. Extract their line items
2. Compare cabinet counts and types per suite
3. Identify items they captured that INNERGY missed, and vice versa

Save to `millwork_company_review.md`.

**⏸️ Gate:**
- **[C] Continue** → Proceed to Step 8
- **[R] Show Results** → Display comparison
- **[S] Stop** → Save state, end analysis

---

### Step 8 — Review Documents

**Required inputs:**
- `innergy_qc.xlsx` — Step 6B output
- `completeness_report.md` — Step 6 output
- `drawing_requirements_checklist.md` — Phase 6A output
- `llm_detailed_results.md` — Step 4 output

**A. Color-coded QC Spreadsheet**
Every INNERGY line item with drawing verification status:
- ✅ CONFIRMED — dimensions and quantity match drawing
- 🔴 DISCREPANCY — dimension or quantity variance found
- ⚠️ NEEDS REVIEW — could not verify, needs field confirmation
- ❌ MISSING — in drawing but not in INNERGY

```bash
# Build comparison file
python3 scripts/build_comparison.py \
  --input "001_input/INNERGY_bid.xlsx" \
  --output "003_extract/innergy_qc.xlsx"

# Populate OC columns with drawing dimensions, color-code
python3 scripts/populate_oc_columns.py \
  --input "003_extract/innergy_qc.xlsx" \
  --output "003_extract/innergy_qc.xlsx"
```

**B. Layered Annotated PDFs**
OCG toggle layers per discrepancy type:
```bash
python3 scripts/annotate_pdf.py \
  --input "003_extract/full_resolution_pages.pdf" \
  --output "005_deliverables/DISCREPANCY_REVIEW_[project]_[issue].pdf" \
  --pages "2" \
  --title "Issue title" \
  --discrepancy "Line 1|Line 2|Action" \
  --issue floating_shelf
```

**C. Executive Summary**
High-level: total line items, confirmed count, discrepancy count, critical items, recommended next steps.

Output: `ESTIMATE_REVIEW_[ProjectName]_[date].md`

**⏸️ Gate:**
- **[C] Continue** → Finalize all documents
- **[R] Show Results** → Preview deliverables
- **[S] Stop** → Hold for further review

---

## Scripts

### scripts/modify_spreadsheet.py
Reads INNERGY xlsx → extracts all line items with X/Y/Z/qty/suite → outputs clean xlsx for QC.
```
python3 scripts/modify_spreadsheet.py \
  --input path/to/input.xlsx \
  --output path/to/output.xlsx
```

### scripts/build_comparison.py
Builds initial QC comparison spreadsheet from raw INNERGY bid xlsx. Extracts Name, Location (SUITE from column 10), Origin/SKU, X, Y, Z, Qty.
```
python3 scripts/build_comparison.py \
  --input path/to/INNERGY_bid.xlsx \
  --output path/to/analysis/innergy_qc.xlsx
```

### scripts/populate_oc_columns.py
Populates OC (OpenClaw/Drawing) columns with drawing-extracted dimensions and applies color coding.
```
python3 scripts/populate_oc_columns.py \
  --input path/to/innergy_qc.xlsx \
  --output path/to/analysis/innergy_qc.xlsx
```

### scripts/completeness_check.py
Compares drawing cabinet counts against INNERGY line items. Identifies mislabeled items, missing cabinets, F1-F6 variants, extra items, scope LF discrepancies.
```
python3 scripts/completeness_check.py \
  --drawing path/to/drawings.pdf \
  --innergy path/to/innergy_qc.xlsx \
  --output path/to/completeness_report.md
```

### scripts/annotate_pdf.py
Creates OCG-layered annotated PDFs. Supports auto-coordinate detection via `--issue` flag.
```
python3 scripts/annotate_pdf.py \
  --input path/to/drawings.pdf \
  --output path/to/output.pdf \
  --pages 2 \
  --discrepancy "Line 1|Line 2|Action" \
  --title "Title" \
  --issue floating_shelf
```

### scripts/score_qc_run.py
Scores a completed QC run against the rubric. Produces a standardized score report with failed items and autoresearch log entry.
```
python3 scripts/score_qc_run.py \
  --completeness path/to/completeness_report.md \
  --xlsx path/to/innergy_qc.xlsx \
  --output path/to/qc_score.md \
  --round N
```

### scripts/find_annotation_coords.py
Finds bounding-box coordinates of markers/text on PDF page for `--lasso`.
```
python3 scripts/find_annotation_coords.py \
  --pdf path/to/drawings.pdf \
  --page 2 \
  --search "F6"
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
| F1-F6 filler/panels in drawing but no corresponding INNERGY items | Fillers/panels often excluded from takeoff | Flag for review |

---

## Project Structure

```
~/Desktop/Projects/
  006A_ProjectName/
    001_input/
      source_drawing.pdf
      INNERGY_estimating.xlsx
      scope_of_work.pdf
      [other customer supplied files]
    002_LLM_analysis/
      compressed_PART1.pdf            # Compressed PDF parts (for Claude)
      compressed_PART2.pdf
      compressed_PART3.pdf
      compressed_PART4.pdf
      page_identification_PART1.md   # Per-part page ID prompts (create per project)
      page_identification_PART2.md
      ...
      llm_results_PART1.md            # Claude outputs (download from Claude)
      llm_results_PART2.md
      ...
      llm_page_results.md             # Combined page ID results
      full_resolution_pages.pdf        # Full-res extracted pages (after Step 3)
      detailed_analysis.md            # Detailed analysis prompt (create after Step 2)
      llm_detailed_results.md         # Claude detailed output
    003_extract/
      innergy_qc.xlsx                 # INNERGY extracted line items
      scope_summary.md                # Scope extraction output
      full_resolution_pages.pdf        # Copied from 002_LLM_analysis
    004_comparison/
      completeness_report.md          # Completeness check output
      drawing_requirements_checklist.md  # Construction notes checklist
    005_deliverables/
      innergy_qc_colorcoded.xlsx     # Final color-coded spreadsheet
      ESTIMATE_REVIEW_[Project]_[date].md  # Executive summary
      DISCREPANCY_REVIEW_[Project]_[issue].pdf  # Annotated PDFs
```

**Rule: Create files when you need them, not before.** Detailed analysis prompt → after Step 2. Extraction → after getting page numbers. Never create output files before the triggering input exists.

---

## Tips

- **Extract dimension strings before interpreting them.** Use PyMuPDF to extract ALL dimension callouts (strings with `'` or `"`) with x,y positions. Sort by y then x to see vertical stacking. Manually map each to what it labels.
- **Dimension strings vary by drawing.** A "1'-8"" could be a wall cabinet height, shelf spacing, or filler width. Always extract and verify.
- **Verify cabinet heights from callouts.** Don't assume base = 34", wall = 36", tall = 90" across all projects. Extract the actual dimension strings from the drawing's own callouts.
- **Floating shelf mislabel:** Standard floating shelf depth = 12". Countertop depth = 25". Y=25 and labeled "Floating Shelf PL" = mislabeled countertop.
- **Base cabinet height:** Standard 34" to top. INNERGY often uses 32.52" (~1.5" manufacturing tolerance). Known systematic difference, not necessarily an error.
- **DieWall items:** Usually floor-to-ceiling panels. Verify height from drawings.
- **ST3 = backsplash tile, NOT a wall cabinet.** B1/B2 = rubber base material. P1 = paint finish.
- **T/R/C are features within cabinets**, not separate cabinet types.
- **F1-F6 filler/panel markers:** These ARE cabinet fragments and ARE frequently missed in INNERGY takeoffs. Count with vision.
- **Scope from customer docs only.** Never use the millwork company's proposal as the scope source.
