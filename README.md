<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0A0F1C,25:111827,50:1E3A5F,75:2563EB,100:3B82F6&height=240&section=header&text=FinController%20Pro&fontSize=72&fontColor=ffffff&animation=fadeIn&fontAlignY=34&desc=Enterprise%20Financial%20Dashboard%20%E2%80%94%20Single-Page%20ERP&descSize=18&descAlignY=55&descColor=93C5FD" width="100%" />
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/javascript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" /></a>
  <a href="#"><img src="https://img.shields.io/badge/ApexCharts-3.44-008FFB?style=for-the-badge&logo=apachecharts&logoColor=white" /></a>
  <a href="#"><img src="https://img.shields.io/badge/single_file-258_KB-10B981?style=for-the-badge" /></a>
  <a href="#"><img src="https://img.shields.io/badge/zero_dependencies-no_server-6366F1?style=for-the-badge" /></a>
  <a href="#"><img src="https://img.shields.io/badge/charts-27+_interactive-EC4899?style=for-the-badge" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2DD4BF?style=for-the-badge" /></a>
</p>

<p align="center">
  <b>21 Modules</b> · <b>27 Charts + 6 Sparklines</b> · <b>7 Waterfall Bridges</b> · <b>Dark/Light Theme</b> · <b>XLSX & PPTX Export</b>
</p>

---

## What is FinController Pro?

**FinController Pro** is a fully self-contained, single-file financial dashboard that replicates the core functionality of an enterprise Financial Planning & Analysis (FP&A) system — without servers, databases, or backend infrastructure. Open one HTML file and get the full CFO cockpit.

Built as a **PFA (Projet de Fin d'Année)** at **ENCG Agadir** (2025–2026), it demonstrates how modern front-end engineering can deliver enterprise-grade financial reporting, variance analysis, and decision support in a zero-dependency package that runs anywhere — a laptop, a USB drive, or a GitHub Pages deployment.

### The Problem It Solves

Management controllers spend hours switching between Excel files, ERP extracts, and PowerPoint decks to prepare month-end reporting packs. FinController Pro consolidates the entire **month-end close workflow** into a single interactive dashboard:

| Traditional Workflow | FinController Pro |
|---------------------|-------------------|
| 5+ Excel files for P&L, BS, CF, variances | **1 file**, all statements linked |
| Manual waterfall charts in PowerPoint | **7 auto-computed waterfall bridges** |
| Static PDF reporting pack | **Interactive charts** with drill-down |
| Copy-paste variance commentary | **Built-in commentary workshop** with history |
| Separate covenant compliance tracker | **Live covenant dashboard** with headroom |
| No scenario modeling | **3 scenarios** (Base / Upside / Downside) with sensitivity |

<br/>

## Demo Company

The dashboard ships with a fully integrated demo dataset for **Nexova Group S.A.**, a fictional €610M European industrial group with two operating divisions:

| Entity | Description | YTD Revenue |
|--------|-------------|-------------|
| **Division A — Industrial** | Manufacturing & engineering | ~€92.5M |
| **Division B — Services** | Field services & digital solutions | ~€38.0M |
| **HQ / Corporate** | Finance, HR, IT shared services | — |

All financial data is internally consistent: the P&L feeds the balance sheet, the balance sheet feeds the cash flow, the cash flow feeds the covenant tracker, and every waterfall bridge adds up to the penny.

<br/>

## Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        FinController Pro — SPA                           │
│                        (Single HTML File, 258 KB)                        │
├──────────┬──────────┬──────────┬──────────┬──────────┬────────────────────┤
│ Executive│ Financial│ Variance │ Working  │ Forecast │   Governance &     │
│ Summary  │Statements│ Analysis │ Capital  │ & Scenar.│   Close Mgmt       │
├──────────┴──────────┴──────────┴──────────┴──────────┴────────────────────┤
│                     Rendering & Interaction Layer                         │
│    ApexCharts 3.44 · Theme Engine · Section Router · Export Pipeline      │
├──────────────────────────────────────────────────────────────────────────-┤
│                     Data Model (window.NEXOVA_DATA)                       │
│   Actuals (12mo + YTD) · Budget (12mo + YTD + FY) · Prior Year (12mo)    │
│   Balance Sheet · Cash Flow · Working Capital · Debt · Forecast · Alerts  │
├───────────────────────────────────────────────────────────────────────────┤
│                     Build System (Node.js)                                │
│            src/index.html + data.js + app.js + style.css                  │
│                    → Single self-contained index.html                     │
└───────────────────────────────────────────────────────────────────────────┘
```

<br/>

## All 21 Modules

### 📊 Executive Layer

| # | Module | Key Visuals |
|---|--------|-------------|
| 1 | **Executive Summary** | 6 sparklines, Revenue waterfall (Budget→Actual), EBITDA bridge (PY→Actual), AI commentary, top alerts |
| 2 | **KPI Scorecard** | Revenue / EBITDA / Net Income / FCF / Headcount / NWC — each with actual, budget, PY, variance %, RAG status |
| 3 | **Management Dashboard** | Revenue trend (12 months), EBITDA margin trend, quarterly stacked bar, monthly P&L heatmap |

### 📑 Financial Statements

| # | Module | Key Visuals |
|---|--------|-------------|
| 4 | **Income Statement (P&L)** | Full P&L with actual / budget / PY / variance columns, conditional formatting, margin rows |
| 5 | **Balance Sheet** | Current vs prior, asset/liability composition donut, equity bridge, quarterly BS trend |
| 6 | **Intercompany Reconciliation** | 4-entity matrix, matched/gap/missing status, Sankey-style flow chart, unmatched items table |
| 7 | **Cash Flow Statement** | Operating / Investing / Financing waterfall, quarterly CF stacked bar, cash quality & liquidity card |

### 🔍 Analysis & Variance

| # | Module | Key Visuals |
|---|--------|-------------|
| 8 | **Budget vs Actuals** | P&L variance table with materiality filter, Budget→Actual EBITDA bridge, favorable/unfavorable bars |
| 9 | **Variance Analysis** | Revenue VPM decomposition (Volume / Price / Mix), cost walk waterfall, full P&L variance decomposition table |
| 10 | **Margin Analysis** | Gross / EBITDA / EBIT / Net margin trends, operating leverage scatter, margin waterfall (Gross→Net) |
| 11 | **Cost Centers** | 3 divisions + 8 departments, entity filter, actual vs budget bars, RAG-coded variance, FTE tracking |

### 💬 Commentary & Working Capital

| # | Module | Key Visuals |
|---|--------|-------------|
| 12 | **Commentary Workshop** | Rich-text editor, version history, inline formatting, section-aware commentary storage |
| 13 | **Working Capital Dashboard** | DSO / DPO / DIO / CCC gauges with budget & PY benchmarks, NWC bridge waterfall, quarterly trend |
| 14 | **Aging Detail** | AR aging buckets (Current to 90d+), AP aging, top overdue customers table with status badges |

### 🔮 Forecasting & Planning

| # | Module | Key Visuals |
|---|--------|-------------|
| 15 | **Rolling Forecast** | 6-month editable forecast grid with sensitivity drivers (volume, price, opex, FX) |
| 16 | **Forecast Accuracy** | Revenue / EBITDA / Net Income — forecast vs actual with MAPE calculation |
| 17 | **Scenario Planning** | Base / Upside / Downside scenarios, revenue & EBITDA comparison chart, scenario assumption panel |

### ⚙️ Governance & Close

| # | Module | Key Visuals |
|---|--------|-------------|
| 18 | **Alerts & Actions** | Severity-coded alerts (HIGH / MEDIUM / POSITIVE), What / Why / Action structure |
| 19 | **Accruals Register** | 19 accrual items across 5 categories, monthly posting status matrix (Posted / Pending / Review) |
| 20 | **Debt & Covenants** | 3 facilities, maturity profile, covenant compliance gauges (ND/EBITDA, Interest Coverage, Liquidity) |
| 21 | **Month-End Checklist** | Task-level close tracker with owner, status, and progress bar |

<br/>

## Technical Highlights

### Zero-Dependency Architecture
The entire application compiles into a **single 258 KB HTML file** with no external dependencies at runtime. All JavaScript, CSS, and data are inlined. Libraries (ApexCharts, SheetJS, PptxGenJS) are loaded from CDN — the app works on any modern browser with an internet connection.

### Chart Engine
- **ApexCharts 3.44.0** — migrated from Chart.js for superior waterfall (rangeBar) support
- **27 interactive charts** + 6 header sparklines
- **7 waterfall bridges**: Revenue (Budget→Actual), EBITDA (PY→Actual), Cash Flow, BvA EBITDA, Revenue VPM Walk, Cost Walk, NWC Bridge
- **1 margin waterfall**: Gross Margin → Net Margin cascade
- Custom `addWaterfallConnectors()` function draws dashed SVG connector lines between bars (zebra-chart style)

### Theme Engine
- Light and dark mode with CSS custom properties and `[data-theme="dark"]` selectors
- **15+ ApexCharts SVG overrides** for dark-mode chart legibility
- Dynamic color getters: `getCActual()` returns `#1A1A1A` in light mode, `#B0BEC5` in dark
- Data labels: `position: 'top'`, `offsetY: -12`, always outside bars, theme-aware colors

### Export Pipeline
- **XLSX Export** — Full financial data export via SheetJS (xlsx 0.18.5)
- **PPTX Export** — Board-ready slide deck generation via PptxGenJS (3.12.0)

### Mathematical Integrity
Every number in the dashboard is audited for internal consistency:
- Budget full-year totals = sum of 12 monthly values
- Working capital ratios match quarterly trend data
- Balance sheet trends match current period balances
- Facility drawn amounts reconcile to balance sheet debt
- Net debt = total debt − cash
- Covenant ratios computed from LTM EBITDA
- All waterfall bridges sum to the correct variance
- Margin waterfall computed dynamically from P&L data

<br/>

## Tech Stack

<table>
  <tr>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" width="40" /><br/>
      <sub><b>JavaScript ES6+</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="40" /><br/>
      <sub><b>HTML5</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="40" /><br/>
      <sub><b>CSS3</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="40" /><br/>
      <sub><b>Node.js</b></sub><br/>
      <sub>Build only</sub>
    </td>
    <td align="center" width="120">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachecharts/apachecharts-original.svg" width="40" /><br/>
      <sub><b>ApexCharts</b></sub><br/>
      <sub>3.44.0</sub>
    </td>
  </tr>
</table>

| Component | Library | Purpose |
|-----------|---------|---------|
| Charts | ApexCharts 3.44.0 | All 27 interactive charts + waterfalls |
| Spreadsheet Export | SheetJS (xlsx) 0.18.5 | XLSX financial data export |
| Presentation Export | PptxGenJS 3.12.0 | Board-ready PPTX slide decks |
| Build System | Node.js (build.js) | Combines 4 source files → 1 output HTML |

<br/>

## Quick Start

### Option 1 — Just Open It
```bash
# No build needed — open the pre-built file directly
open index.html
# or on Windows:
start index.html
```

### Option 2 — Build from Source
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/FinController_Pro.git
cd FinController_Pro

# Build the single-file output
node build.js

# Open the result
open index.html
```

### Option 3 — Deploy to GitHub Pages
```bash
# Push to GitHub, then enable Pages in repo Settings
# Point to the root folder → index.html serves automatically
# Your dashboard is now live at https://YOUR_USERNAME.github.io/FinController_Pro/
```

<br/>

## Project Structure

```
FinController_Pro/
│
├── src/                              # Source files (development)
│   ├── index.html                    # HTML structure — 21 sections, navigation, modals
│   ├── data.js                       # Complete financial data model (415 lines)
│   ├── app.js                        # Rendering engine — 2,943 lines of chart & table logic
│   └── style.css                     # Design system — light/dark themes, responsive layout
│
├── build.js                          # Build script — inlines everything into one HTML file
├── index.html                        # ← Built output (258 KB, ready to deploy)
│
└── github-ready/                     # Clean deployment folder
    └── index.html                    # Same built output for GitHub Pages
```

### Data Model (`data.js`)

The data model is a single `window.NEXOVA_DATA` object containing:

```
NEXOVA_DATA
├── company                   # Name, ticker, currency, period
├── commentary                # CFO narrative (auto-referenced in alerts)
├── actuals
│   ├── monthly[]             # 12 months × 14 P&L fields
│   └── ytd                   # Year-to-date aggregates + margin ratios
├── budget
│   ├── monthly[]             # 12 months × 14 P&L fields
│   ├── ytd                   # YTD budget + margins
│   └── fullYear              # Annual operating plan
├── priorYear
│   ├── monthly[]             # 12 months PY comparatives
│   └── ytd                   # YTD PY + margins
├── balanceSheet
│   ├── current               # 25 line items (assets, liabilities, equity)
│   ├── prior                 # Prior period comparatives
│   └── trends[]              # 4 quarters (assets, liabilities, net debt)
├── cashFlow
│   ├── ytd                   # Operating / Investing / Financing / FCF
│   └── quarterly[]           # 4 quarters
├── workingCapital
│   ├── current               # DSO, DPO, DIO, CCC, NWC, ratios
│   ├── budget / priorYear    # Benchmarks
│   ├── quarterly[]           # 4-quarter trend
│   ├── ar_aging[]            # 5 buckets with amounts & percentages
│   ├── ap_aging[]            # 5 buckets
│   ├── ar_customers[]        # Top overdue debtors
│   └── inventory[]           # SKU-level inventory detail
├── accruals[]                # 19 items × monthly posting status
├── forecastAccuracy          # 6-month forecast vs actual
├── interco                   # 4-entity matrix with 7 transactions
├── costCenters[]             # 3 divisions, 8 departments
├── headcount                 # Actual / budget / PY / variance
├── debt
│   ├── facilities[]          # 3 debt instruments with drawn/available
│   ├── covenants[]           # 3 covenants with actual/threshold/headroom
│   └── netDebt / netDebtEbitda
├── forecast
│   ├── base[]                # 6-month rolling forecast (editable)
│   └── drivers               # Sensitivity parameters
├── alerts[]                  # 4 structured alerts (What / Why / Action)
└── closeChecklist[]          # Month-end close tasks
```

<br/>

## Waterfall Bridge Methodology

All 7 waterfall charts use ApexCharts `rangeBar` type with `[low, high]` data pairs. Each bridge is mathematically verified:

| Bridge | From → To | Steps | Total |
|--------|-----------|-------|-------|
| **Revenue Waterfall** | Budget → Actual | Volume −5.0, Price/Mix −1.8, FX −2.2, Recovery +1.5 | **−7.5** ✓ |
| **EBITDA Bridge** | PY → Actual | Rev Growth +9.0, COGS −2.5, Opex −1.2, Leverage +1.5 | **+6.8** ✓ |
| **Cash Flow Bridge** | OpCF → Net | Operating +15.3, Investing −9.1, Financing −7.5 | **−1.3** ✓ |
| **BvA EBITDA** | Budget → Actual | Volume −2.1, Price +0.5, COGS +1.0, SG&A −2.0 | **−2.6** ✓ |
| **Revenue VPM Walk** | Budget → Actual | Volume −5.0, Price +0.5, Mix −3.0 | **−7.5** ✓ |
| **Cost Walk** | Budget → Actual | Materials +1.5, Volume −3.2, Procurement −1.9 | **−3.6** ✓ |
| **NWC Bridge** | Prior → Current | AR +2.5, Inventory +0.9, AP −2.1 | **+1.3** ✓ |

<br/>

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `D` | Toggle dark / light theme |
| `←` / `→` | Navigate between sections |
| `Ctrl + E` | Export to XLSX |
| `Ctrl + P` | Export to PPTX |

<br/>

## Academic Context

| | |
|---|---|
| **Program** | PFA — ENCG Agadir 2025–2026 |
| **Field** | Management Control (Contrôle de Gestion) |
| **Focus** | Financial Planning & Analysis (FP&A) Decision Support |
| **Approach** | Single-page application replacing traditional Excel-based reporting |
| **Key Concepts** | Variance decomposition (VPM), waterfall bridge analysis, covenant compliance monitoring, rolling forecast methodology, working capital optimization |

<br/>

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0A0F1C,25:111827,50:1E3A5F,75:2563EB,100:3B82F6&height=100&section=footer" width="100%" />
</p>
