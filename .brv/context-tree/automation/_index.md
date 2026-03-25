---
children_hash: 60969435a2732375143039ecf3e21c90f899fbf145691669e09d61865ff82671
compression_ratio: 0.6901639344262295
condensation_order: 2
covers: [millwork_qc/_index.md]
covers_token_total: 610
summary_level: d2
token_count: 421
type: summary
---
# Millwork QC and Extraction Overview (d2)

This domain automates millwork bid verification and architectural drawing interpretation, centering on data classification and document extraction reliability.

## Core Workflows
* **Innergy QC Skill**: Automates bid verification against drawings, processing up to 125 line items per bid. Outputs include annotated PDFs and QC Excel files, covering file auditing, scope extraction, and drawing reduction.
* **PDF Extraction Workflow**: Translates architectural documents into machine-readable data. Uses 1-indexed page numbering for human-reference, mapping to 0-indexed internal logic. Reliability depends on verifying suite names against extracted text to ensure accurate page-to-suite mapping.
* **Drawing Dimension Extraction**: Standardizes spatial data retrieval. Dimensions are extracted with x,y coordinates before mapping to labels to prevent interpretation errors, such as misidentifying row heights versus total heights (e.g., 1'-8" vs 7'-6").

## Quality Control & Detection Logic
* **Floating Shelf Mislabeling (595 Market St)**: Addresses frequent mislabeling of countertops as "Floating Shelf PL." Detection logic flags items at Y=25 (vs. standard Y=12) to reclassify them as "PL Top" or "Solid Surface."

## Key Conventions
* **Spatial Accuracy**: Always extract dimension strings with x,y positions before establishing discrepancy rules.
* **Indexing**: Scripts must utilize 1-indexed numbering, cross-validated against suite names found in document text.

*For comprehensive details, refer to `innergy_qc_skill.md`, `pdf_extraction_workflow.md`, `drawing_dimension_extraction.md`, and the `floating_shelf_mislabel` topic.*