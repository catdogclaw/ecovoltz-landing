---
children_hash: 5feea608b67d1155391e1300ce90a78f60ba1892ff4f3af10cbf0f48f273c50d
compression_ratio: 0.5684782608695652
condensation_order: 1
covers: [drawing_dimension_extraction.md, floating_shelf_mislabel/_index.md, innergy_qc_skill.md, pdf_extraction_workflow.md]
covers_token_total: 920
summary_level: d1
token_count: 523
type: summary
---
# Millwork QC and Extraction Overview

This domain focuses on the automation of millwork bid verification and drawing interpretation, specifically addressing challenges in document extraction and data classification for projects like 595 Market Street.

## Core Workflows and Skills
* **Innergy QC Skill**: The primary engine for verifying millwork bids against architectural drawings. It processes up to 125 line items per bid, delivering annotated PDFs and QC Excel files. The workflow covers file auditing, scope extraction, drawing reduction, and INNERGY data extraction. Refer to `innergy_qc_skill.md` for details.
* **PDF Extraction Workflow**: Manages the technical translation of architectural documents. It uses 1-indexed page numbering for human-readable references (mapping to 0-indexed internal PDF logic). Key reliability practice: always verify suite names in extracted text to ensure accurate page-to-suite mapping. Refer to `pdf_extraction_workflow.md`.
* **Drawing Dimension Extraction**: Standardizes how dimensions are pulled from millwork drawings. The process requires extracting all dimension strings with their x,y coordinates before mapping them to labels. This helps prevent interpretation errors, such as confusing row height with total height (e.g., 1'-8" vs 7'-6"). Refer to `drawing_dimension_extraction.md`.

## Quality Control and Error Detection
* **Floating Shelf Mislabeling**: A critical detection rule for the 595 Market Street project. Countertops are frequently mislabeled as "Floating Shelf PL." The detection logic identifies these items by checking for Y=25 coordinates (standard shelves are Y=12) and reclassifies them as "PL Top" or "Solid Surface." Refer to `floating_shelf_mislabel/_index.md` for specific detection logic and drill-down.

## Key Conventions and Rules
* **Dimension Mapping**: Always extract dimension strings with x,y positions before building discrepancy rules to ensure spatial accuracy.
* **Page Management**: Use 1-indexed numbering for extraction scripts; verify mappings against suite names extracted from the document text.