---
title: PDF Extraction Workflow
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-25T02:22:31.615Z'
updatedAt: '2026-03-25T02:22:31.615Z'
---
## Raw Concept
**Task:**
Document PDF extraction and annotation workflow

**Flow:**
extract pages (1-indexed) -> verify suite names -> annotate

## Narrative
### Structure
The workflow handles PDF processing using 1-indexed page numbering corresponding to human-readable pages.

### Highlights
Mapping pages correctly is critical. Always verify suite names in extracted text to ensure correct page-to-suite mapping.

### Rules
extract_pages.py uses 1-indexed numbering. PDF page indices are 0-indexed internally.

## Facts
- **page_numbering**: extract_pages.py uses 1-indexed page numbers [convention]
- **verification_method**: Verify page mappings by checking suite names in extracted text [project]
