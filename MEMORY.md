# MEMORY.md — CatDogBot Long-Term Memory

_Last updated: 2026-03-23_

## About Cat

- **Name:** Cat Dogclaw
- **Pronouns:** she/her
- **Location:** Santa Cruz, California
- **Background:** Construction/casework engineer, studied in Louisiana
- **Goal:** Automate estimator work for millwork pricing for large corporate customers
- **Target tool:** INNERGY (estimating, takeoff, CRM/bids, job costing)
- **Computer:** Mac Mini (Apple Silicon), macOS, node v22.22.1

## Contacts

- **John** — Telegram ID: `8790093946`
- **Melissa** — Telegram ID: `8774928535`

## Network Setup

- **Mac Mini IP:** 192.168.1.214 (hostname: Cats-Mac-mini.local)
- **Router:** TP-Link AX1800 (192.168.1.1)
- **LAN Isolation:** ENABLED on router — Mac mini is isolated from all LAN devices (192.168.1.x). Internet access still works.
- **Tailscale:** OFF
- **Gateway bind:** loopback only

## OpenClaw Configuration

- **Version:** 2026.3.22
- **Config file:** `/Users/catdogclaw/.open-claw-secure/openclaw.json`
- **Tools profile:** full (exec, file, web, message, etc. enabled)
- **Workspace:** `/Users/catdogclaw/.open-claw-secure/.openclaw/workspace`
- **Gateway port:** 18789
- **Default model:** `minimax/MiniMax-M2.7` (reasoning enabled)
- **Telegram model:** `minimax/MiniMax-M2.7` (switched from Gemini 2026-03-23)
- **Available models:** M2.7, M2.7-highspeed, M2.5, M2.5-highspeed, M2.5-Lightning, Qwen 3.5 27B (via Ollama)

## Capabilities Set Up

### Apple Notes
- **Tool:** `memo` CLI + AppleScript
- Working — can create, read, search, delete notes

### Image Generation (Local)
- **Setup:** Stable Diffusion via Python/diffusers/huggingface
- **Model:** runwayml/stable-diffusion-v1-5 (downloaded ~4GB)
- **Hardware:** Uses Apple Metal GPU (MPS) — ~11 sec per image at 20 steps
- **Output:** `~/Documents/AI_Generated_Images/`

### SVG Graphics
- Can generate SVG diagrams programmatically

### Telegram
- Bot token configured
- John (8790093946) and Melissa (8774928535) on allowlist
- dmScope: "main" (set 2026-03-23) — John's messages route to main session
- John received full workflow overview 2026-03-23

### Vision
- **imageModel:** `google/gemini-2.5-flash` (set 2026-03-19)

## MILLWORK ESTIMATING PROJECT (Active)

### innergy-qc Skill
- **Location:** `~/.open-claw-secure/.openclaw/workspace/skills/innergy-qc/`
- **Purpose:** PDF drawing analysis + INNERGY spreadsheet comparison for QC
- **Workflow:** Drop files in `~/Desktop/Incoming_Projects/` → numbered project folder → analysis
- **Scripts:**
  - `modify_spreadsheet.py` — extracts INNERGY data to xlsx
  - `completeness_check.py` — checks for missing/extra/mislabeled items
  - `annotate_pdf_ocg.py` — creates OCG-layered annotated PDFs

### 595 Market Street Project (Completed 2026-03-23)
- **Spec PDF:** 67 pages, ~43MB (595 Market Street, Suite 1200 spec)
- **Bid spreadsheet:** INNERGY estimating spreadsheet
- **Key findings:**
  - Base cabinet Y-height systematic discrepancy: drawing 34" vs INNERGY 32.52" (~1.5" diff)
  - Wall cabinet height (Suite 1300): drawing 38" vs INNERGY 36" (~2" diff)
  - 9 mislabeled floating shelf items (X=91.49" Y=25" → likely PL Tops)
  - 3 missing base cabinets in Suite 1300 Break
  - 90" tall cabinets in Suite 1150 — scope authorized but drawing unclear
- **Deliverables:**
  - `innergy_qc.xlsx` — 125 line items, color-coded
  - 5 annotated PDFs with OCG toggle layers
  - `completeness_check_report.md`

### INNERGY Pricing Engine (reverse-engineered)
**Fabrication labor rates:**
- Drafting: $66.99/hr
- Engineering: $66.99/hr
- Casework Build: $79.32/hr
- Custom Build: $79.32/hr
- Parts Production: $0.50–$0.62/sq.ft.
- Countertop Fab: $79.32/hr
- CA Journeyman (Install): $113.22/hr
- Load & Delivery: $25–$32/cabinet

**Margin structure:**
1. Material Cost + Labor Cost = Product Cost
2. Baseline margin ~38.81% → baseline price
3. ±0.05% bump/discount
4. Adjusted margin ~36% → TOTAL PRODUCT PRICE (no sales tax in CA)
5. Install: same margin chain → TOTAL INSTALL PRICE
6. Line item = Product Price + Install Price

## EcoVoltz Website (ecovoltz.com)

- **Repo:** github.com/catdogclaw/ecovoltz-landing
- **Framework:** React + Tailwind + TypeScript + Vercel
- **DNS:** Vercel nameservers (ns1/ns2.vercel-dns.com) ✅
- **SSL:** Working ✅
- **Email:** MX records in Vercel DNS pointing to Google Workspace ✅

## Notes
- Session context auto-compacts at 200k tokens; manual MEMORY.md used for long-term recall
- User prefers files saved to ~/Documents/ over hidden workspace folders when possible
- InnerGy runs on a SEPARATE computer (not this Mac mini)
