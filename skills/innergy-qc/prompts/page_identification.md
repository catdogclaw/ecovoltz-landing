# LLM Page Identification Prompt
# Use with: compressed.pdf
# Output: llm_page_results.md

---

You are scanning a [N]-page architectural PDF to identify millwork-relevant pages.

Your ONLY task: identify and list every page number that contains millwork, cabinetry, casework, or closely related content. Be conservative — if in doubt, include the page.

Include pages with:
- Cabinet/counter/vanity elevations or plans
- Millwork details or sections
- Finish schedules (casework, countertops, panels)
- Any note mentioning: cabinet, counter, vanity, shelf, panel, millwork, casework, bracket, backing, blocking, support, woodwork
- Plumbing fixtures integrated into millwork (sinks in vanities, etc.)
- Electrical outlets in millwork areas
- General notes pages that reference millwork scope
- Any page with PL-, SS-, WB-, WD-, ST-, CH-, LA- codes

Output format — simple list:
```
Page X: [brief reason — e.g. "L1 Breakroom elevation AT6.4"]
Page Y: [brief reason — e.g. "Finish schedule includes casework codes"]
```

List every millwork-relevant page. Do not describe the content in detail — just identify the page and why it matters.

After listing pages, provide:
1. Total page count found
2. List of page ranges (e.g. "pages 31-55, then 84-92")
