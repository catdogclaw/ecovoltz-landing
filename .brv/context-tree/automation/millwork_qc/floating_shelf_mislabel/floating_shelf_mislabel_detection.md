---
title: Floating Shelf Mislabel Detection
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-25T02:22:04.020Z'
updatedAt: '2026-03-25T02:22:04.020Z'
---
## Raw Concept
**Task:**
Detect and reclassify mislabeled floating shelves

**Changes:**
- Added detection rule for mislabeled floating shelves

**Files:**
- 595 Market Street project

**Flow:**
Detect item labeled Floating Shelf PL with Y=25 -> Reclassify as PL Top or Solid Surface

**Timestamp:** 2026-03-25

## Narrative
### Structure
Floating shelves are incorrectly labeled in 595 Market Street project.

### Dependencies
Items with Y=25 and Z=2 are countertops, not shelves.

### Highlights
10 items identified as mislabeled countertops.

### Rules
Rule: Floating shelf with Y=25 in INNERGY is a mislabeled countertop.

## Facts
- **mislabel_issue**: Floating shelves in 595 Market Street are mislabeled as 'Floating Shelf PL' [project]
- **shelf_dimension**: Standard floating shelf Y-length is 12 [project]
- **countertop_dimension**: Mislabeled shelves have Y=25 (countertop length) and Z=2 (thickness) [project]
