---
title: Drawing Dimension Extraction
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-25T02:21:43.759Z'
updatedAt: '2026-03-25T02:21:43.759Z'
---
## Raw Concept
**Task:**
Standardize dimension extraction from millwork drawings

**Changes:**
- Added dimension extraction rule

**Files:**
- 595 Market Street Suite 1300

**Flow:**
extract dimensions -> map to labels -> apply discrepancy rules

**Timestamp:** 2026-03-25

## Narrative
### Structure
Process for interpreting drawing dimensions for millwork.

### Highlights
Avoided misinterpreting row height (1'-8") as total height (38") in cabinet design. Total height was 7'-6".

### Rules
Always extract ALL dimension strings with x,y positions from the drawing PDF first, then manually map each to what it labels, before building any discrepancy rules.

## Facts
- **dimension_extraction**: Always extract dimension strings with x,y positions from drawings before interpretation [convention]
- **dimension_interpretation**: Misinterpreting row height as total height is a common error [convention]
