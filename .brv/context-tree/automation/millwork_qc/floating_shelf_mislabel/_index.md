---
children_hash: aaf06562cf72759defe2013433ab3d317458302927d3d6f0c5ba873e285890c7
compression_ratio: 0.45323741007194246
condensation_order: 0
covers: [floating_shelf_mislabel_detection.md]
covers_token_total: 278
summary_level: d0
token_count: 126
type: summary
---
### Floating Shelf Mislabel Detection
Context: 595 Market Street project.
Issue: 10 items incorrectly labeled "Floating Shelf PL" are actually countertops.

Key Metrics & Identification:
- Mislabel Indicator: Floating shelves with Y=25 and Z=2 (standard shelf Y=12).
- Flow: Detection logic identifies these items for reclassification to "PL Top" or "Solid Surface."

Rules:
- Floating shelf with Y=25 in INNERGY is a mislabeled countertop.

For deep-dive, refer to `floating_shelf_mislabel_detection.md`.