---
children_hash: 06df0e9086ec48e6ebc305e916cc68944308b4b62ea14d90ac5fc5e4c374f043
compression_ratio: 0.6619915848527349
condensation_order: 3
covers: [agents/_index.md, automation/_index.md]
covers_token_total: 713
summary_level: d3
token_count: 472
type: summary
---
# Structural Overview: Agents and Automation

## Agents Domain
The Agents domain manages autonomous project support, anchored by the CatDogBot project. Designed for Cat Dogclaw (Santa Cruz, CA), the agent automates millwork estimating workflows through the INNERGY integration. Operational state is maintained within the `memory/` directory and `MEMORY.md`.

* Drill-down: Refer to `catdogbot_profile.md` for identity specifications, goals, and technical constraints.

## Automation Domain (QC & Extraction)
This domain standardizes millwork bid verification and architectural drawing interpretation, prioritizing data classification and document extraction reliability.

### Core Workflows
* Innergy QC Skill: Automates bid verification for up to 125 line items, generating annotated PDFs and QC Excel files.
* PDF Extraction Workflow: Translates architectural documents into machine-readable data; utilizes 1-indexed page numbering for human reference, mapped to 0-indexed internal logic. Reliability is ensured by validating suite names against extracted text.
* Drawing Dimension Extraction: Retrieves spatial data using (x,y) coordinates prior to labeling to prevent height identification errors (e.g., differentiating row vs. total heights).

### Quality Control & Detection
* Floating Shelf Mislabeling (595 Market St): Detection logic identifies countertops mislabeled as "Floating Shelf PL" by flagging items at Y=25 (vs. standard Y=12) for reclassification as "PL Top" or "Solid Surface."

### Key Conventions
* Spatial Accuracy: Extract dimension strings with associated (x,y) positions before applying discrepancy rules.
* Indexing: Scripts must use 1-indexed numbering cross-validated with suite names found in document text.

*Drill-down: See `innergy_qc_skill.md`, `pdf_extraction_workflow.md`, `drawing_dimension_extraction.md`, and `floating_shelf_mislabel_detection.md`.*