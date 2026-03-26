# LLM Detailed Analysis Prompt
# Use with: full_resolution_pages.pdf
# Output: llm_detailed_results.md

---

You are analyzing a millwork/cabinetry drawing set for quality control.

**CRITICAL RULES:**
1. Read EVERY page — do not summarize, do not skip pages
2. List items PER PAGE, not aggregated — page number must accompany every item
3. Flag anything referenced on a sheet but NOT actually drawn on that sheet

**1. Material Code Inventory (EXHAUSTIVE — per page)**
For EVERY code found: code, page number, what it describes.
- PL-## / LA-##: Plastic laminate (cabinets, countertops, toilet partitions)
- SS-##: Solid surface material
- WB-##: Wall base material
- WD-##: Wood millwork
- ST-##: Stone countertops
- TL-##: Tile (floor, wall, base, accent)
- MTL-##: Metal trim, frames, Schluter
- AT-##: Architectural treatment/finish keynote
- PT-01 through PT-##: Paint finishes
- CH-##: Cabinet hardware (pulls, edge pulls)
- HD-##: Door/hardware codes
- DH-##: Door hardware
- PP-##: Plumbing fixtures (faucets, sinks, drains)
- PA-##: Plumbing accessories (grab bars, soap dispensers, paper towel holders)
- AP-##: Appliances (refrigerators, microwaves)
- TP-##: Toilet partition codes
- DF-##: Decorative fixtures
- BOCO / GFO / EO-##: Electrical outlet codes
- **EQ##: Equal spacing — NOT cabinets, verify before counting**

**2. Cabinet Count by Suite (PER PAGE enumeration)**
For each suite/room identified:
- Base cabinets (by marker/size/quantity)
- Wall/upper cabinets (by marker/size/quantity)
- Tall cabinets / pantries
- Floating shelves (WD-05 walnut — look for explicit note "floating shelf only")
- Vanities (wall-hung, ADA)
- Built-in banquette seating
- Any integrated appliances

**3. Cabinet Marker Patterns:**
- PL1, PL2 = Plastic laminate finish types
- B1, B2 = Base cabinet variants OR rubber base MATERIAL (verify per project)
- F1-F6 = Filler pieces — **NOTE: Many modern projects use grid line F-codes, NOT filler panels. If you see F1/F2/etc. on floor plans, they are likely COLUMN REFERENCES, not cabinet markers. Check context before listing as millwork.**
- Floating shelves = WD-05 walnut millwork with explicit "floating shelf" note
- T/R/C = Trash/Recycle/Compost (within base cabinets, not separate)
- Tall cabinets = 90"+ height callouts

**4. Millwork Construction Notes (ALL pages)**
Any note with: PROVIDE, NOTE, V.I.F., IN-WALL, BRACKET, BACKING, BLOCKING, SUPPORT, UNDERCOUNTER, VANITY, SHELF, PANEL, MILLWORK, CABINET, CASEWORK, J-MOULDING, STEEL ANGLE, ANCHOR, BOLT, STOP PLYWOOD, CUT-OUT, LED STRIP, COORDINATE

**5. Alerts — Flag these explicitly:**
- Any note saying "See markup drawing" or "see ID drawing" — these may exist outside the PDF
- Any note saying "TBD" or "pending" or "design development" — open scope issue
- Any note saying "OPERATOR TO..." — confirms what's in/out of millwork scope
- Any note saying "GC TO..." or "BY OTHERS" — confirms other trades
- Dimensions marked "V.I.F." (Verify In Field) — require site confirmation
- Appliance placements marked "CONFIRM" or "TBD" — unresolved

**6. Dimension Standards**
- Base cabinet heights (~34" A.F.F. typical)
- Wall cabinet heights (~36"-38" A.F.F.)
- Countertop heights (ADA max 34")
- Any deviations from standard

**7. Finish Schedule (all material specs)**
Manufacturer, product name, color/part number, size

**8. Potential Gaps & QC Flags**
List every open question, coordination issue, and scope ambiguity found.

Be exhaustive. Every code, every page, every note.

---

**OUTPUT INSTRUCTIONS:**
When done, create a file artifact named "llm_detailed_results.md" for download.
