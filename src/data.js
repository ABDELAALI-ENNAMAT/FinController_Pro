// ==========================================
// 1. DATA MODEL (window.NEXOVA_DATA)
// ==========================================
window.NEXOVA_DATA = {
  company: {
    name: "Nexova Group S.A.",
    ticker: "NXV",
    currency: "EUR",
    unit: "M",
    period: "March 2025",
    fy: "FY2025",
    monthEnd: "CLOSED"
  },
  commentary: "YTD revenue of €128.5M was €7.5M (5.5%) below budget of €136.0M, driven by a volume shortfall in Division A Industrial (–€12.5M vs plan) partially offset by strong Division B performance.\n\nEBITDA of €25.6M came in €2.6M below the €28.2M plan at a margin of 19.9%, 80bps below the 20.7% target, reflecting gross margin pressure from materials inflation (+1.8pp) and SG&A over-run in Sales & BD.\n\nThe Group remains within all credit covenants with Net Debt/EBITDA at 1.83x (vs 3.0x limit). Cash conversion cycle deteriorated to 66.5 days (+13d QoQ) driven by DSO increase. Headcount under-budget by 53 FTEs, providing a natural OpEx buffer.",
  
  actuals: {
    monthly: [
      {m:"Jan",revenue:42.5,cogs:24.8,grossProfit:17.7,sgna:5.4,rnd:1.6,gna:2.0,da:2.0,ebit:6.7,interest:0.7,tax:1.5,netIncome:4.5,ebitda:8.7,fcf:3.8,headcount:2831},
      {m:"Feb",revenue:39.8,cogs:23.5,grossProfit:16.3,sgna:5.2,rnd:1.5,gna:1.9,da:2.0,ebit:5.7,interest:0.7,tax:1.3,netIncome:3.7,ebitda:7.7,fcf:3.2,headcount:2839},
      {m:"Mar",revenue:46.2,cogs:27.0,grossProfit:19.2,sgna:6.0,rnd:1.8,gna:2.2,da:2.1,ebit:7.1,interest:0.7,tax:1.6,netIncome:4.8,ebitda:9.2,fcf:4.1,headcount:2847},
      {m:"Apr",revenue:48.5,cogs:28.2,grossProfit:20.3,sgna:6.2,rnd:1.9,gna:2.3,da:2.1,ebit:7.8,interest:0.7,tax:1.8,netIncome:5.3,ebitda:9.9,fcf:4.6,headcount:2851},
      {m:"May",revenue:51.3,cogs:29.5,grossProfit:21.8,sgna:6.5,rnd:2.0,gna:2.4,da:2.2,ebit:8.7,interest:0.7,tax:2.0,netIncome:6.0,ebitda:10.9,fcf:5.2,headcount:2858},
      {m:"Jun",revenue:55.0,cogs:31.4,grossProfit:23.6,sgna:7.0,rnd:2.1,gna:2.5,da:2.3,ebit:9.7,interest:0.7,tax:2.3,netIncome:6.7,ebitda:12.0,fcf:5.8,headcount:2862},
      {m:"Jul",revenue:44.8,cogs:26.2,grossProfit:18.6,sgna:5.8,rnd:1.7,gna:2.1,da:2.1,ebit:6.9,interest:0.7,tax:1.6,netIncome:4.6,ebitda:9.0,fcf:3.9,headcount:2848},
      {m:"Aug",revenue:41.2,cogs:24.2,grossProfit:17.0,sgna:5.3,rnd:1.5,gna:2.0,da:2.0,ebit:6.2,interest:0.7,tax:1.4,netIncome:4.1,ebitda:8.2,fcf:3.4,headcount:2844},
      {m:"Sep",revenue:50.1,cogs:28.8,grossProfit:21.3,sgna:6.4,rnd:1.9,gna:2.3,da:2.2,ebit:8.5,interest:0.7,tax:2.0,netIncome:5.8,ebitda:10.7,fcf:5.0,headcount:2851},
      {m:"Oct",revenue:54.2,cogs:31.0,grossProfit:23.2,sgna:6.8,rnd:2.1,gna:2.5,da:2.3,ebit:9.5,interest:0.7,tax:2.2,netIncome:6.6,ebitda:11.8,fcf:5.6,headcount:2859},
      {m:"Nov",revenue:56.8,cogs:32.4,grossProfit:24.4,sgna:7.2,rnd:2.2,gna:2.6,da:2.3,ebit:10.1,interest:0.7,tax:2.4,netIncome:7.0,ebitda:12.4,fcf:6.1,headcount:2863},
      {m:"Dec",revenue:62.0,cogs:35.2,grossProfit:26.8,sgna:7.8,rnd:2.4,gna:2.8,da:2.4,ebit:11.4,interest:0.7,tax:2.7,netIncome:8.0,ebitda:13.8,fcf:7.0,headcount:2847}
    ],
    ytd: {revenue:128.5,cogs:75.3,grossProfit:53.2,sgna:16.6,rnd:4.9,gna:6.1,da:6.1,ebit:19.5,interest:2.1,tax:4.4,netIncome:13.0,ebitda:25.6,fcf:11.1,grossMargin:41.4,ebitdaMargin:19.9,ebitMargin:15.2,netMargin:10.1}
  },
  
  budget: {
    monthly: [
      {m:"Jan",revenue:45.0,cogs:26.1,grossProfit:18.9,sgna:5.8,rnd:1.7,gna:2.1,da:2.0,ebit:7.3,interest:0.7,tax:1.7,netIncome:4.9,ebitda:9.3,headcount:2870},
      {m:"Feb",revenue:43.0,cogs:25.0,grossProfit:18.0,sgna:5.5,rnd:1.6,gna:2.0,da:2.0,ebit:6.9,interest:0.7,tax:1.6,netIncome:4.6,ebitda:8.9,headcount:2880},
      {m:"Mar",revenue:48.0,cogs:27.8,grossProfit:20.2,sgna:6.2,rnd:1.8,gna:2.2,da:2.1,ebit:7.9,interest:0.7,tax:1.8,netIncome:5.4,ebitda:10.0,headcount:2900},
      {m:"Apr",revenue:50.0,cogs:29.0,grossProfit:21.0,sgna:6.5,rnd:1.9,gna:2.3,da:2.1,ebit:8.2,interest:0.7,tax:1.9,netIncome:5.6,ebitda:10.3,headcount:2900},
      {m:"May",revenue:52.0,cogs:30.2,grossProfit:21.8,sgna:6.7,rnd:2.0,gna:2.4,da:2.2,ebit:8.5,interest:0.7,tax:2.0,netIncome:5.8,ebitda:10.7,headcount:2910},
      {m:"Jun",revenue:56.0,cogs:32.5,grossProfit:23.5,sgna:7.2,rnd:2.2,gna:2.5,da:2.3,ebit:9.3,interest:0.7,tax:2.2,netIncome:6.4,ebitda:11.6,headcount:2910},
      {m:"Jul",revenue:46.0,cogs:26.7,grossProfit:19.3,sgna:6.0,rnd:1.7,gna:2.1,da:2.1,ebit:7.4,interest:0.7,tax:1.7,netIncome:5.0,ebitda:9.5,headcount:2910},
      {m:"Aug",revenue:44.0,cogs:25.5,grossProfit:18.5,sgna:5.7,rnd:1.6,gna:2.0,da:2.0,ebit:7.2,interest:0.7,tax:1.6,netIncome:4.9,ebitda:9.2,headcount:2910},
      {m:"Sep",revenue:51.0,cogs:29.6,grossProfit:21.4,sgna:6.6,rnd:2.0,gna:2.4,da:2.2,ebit:8.2,interest:0.7,tax:1.9,netIncome:5.6,ebitda:10.4,headcount:2920},
      {m:"Oct",revenue:55.0,cogs:31.9,grossProfit:23.1,sgna:7.0,rnd:2.1,gna:2.5,da:2.3,ebit:9.2,interest:0.7,tax:2.1,netIncome:6.4,ebitda:11.5,headcount:2920},
      {m:"Nov",revenue:57.0,cogs:33.1,grossProfit:23.9,sgna:7.3,rnd:2.2,gna:2.6,da:2.3,ebit:9.5,interest:0.7,tax:2.2,netIncome:6.6,ebitda:11.8,headcount:2930},
      {m:"Dec",revenue:63.0,cogs:36.5,grossProfit:26.5,sgna:8.0,rnd:2.5,gna:2.8,da:2.4,ebit:10.8,interest:0.7,tax:2.5,netIncome:7.6,ebitda:13.2,headcount:2930}
    ],
    ytd: {revenue:136.0,cogs:78.9,grossProfit:57.1,sgna:17.5,rnd:5.1,gna:6.3,da:6.1,ebit:22.1,interest:2.1,tax:5.1,netIncome:14.9,ebitda:28.2,grossMargin:42.0,ebitdaMargin:20.7,ebitMargin:16.3,netMargin:11.0},
    fullYear: {revenue:610.0,ebitda:126.4,netIncome:67.2,ebitdaMargin:20.7,grossProfit:256.1,grossMargin:42.0,cogs:353.9,sgna:78.5,rnd:21.3,gna:27.9,da:26.0,ebit:102.4,interest:8.4,tax:26.8}
  },

  priorYear: {
    monthly: [
      {m:"Jan",revenue:36.0,cogs:22.0,grossProfit:14.0,sgna:4.8,rnd:1.2,gna:1.8,da:1.8,ebit:4.4,interest:0.6,tax:1.0,netIncome:2.8,ebitda:6.2},
      {m:"Feb",revenue:34.5,cogs:21.2,grossProfit:13.3,sgna:4.6,rnd:1.1,gna:1.7,da:1.8,ebit:4.1,interest:0.6,tax:0.9,netIncome:2.6,ebitda:5.9},
      {m:"Mar",revenue:38.8,cogs:23.8,grossProfit:15.0,sgna:5.1,rnd:1.3,gna:1.9,da:1.9,ebit:4.8,interest:0.6,tax:1.1,netIncome:3.1,ebitda:6.7},
      {m:"Apr",revenue:40.2,cogs:24.5,grossProfit:15.7,sgna:5.3,rnd:1.4,gna:2.0,da:1.9,ebit:5.1,interest:0.6,tax:1.1,netIncome:3.4,ebitda:7.0},
      {m:"May",revenue:42.1,cogs:25.5,grossProfit:16.6,sgna:5.5,rnd:1.5,gna:2.1,da:1.9,ebit:5.6,interest:0.6,tax:1.3,netIncome:3.7,ebitda:7.5},
      {m:"Jun",revenue:45.5,cogs:27.3,grossProfit:18.2,sgna:6.0,rnd:1.6,gna:2.2,da:2.0,ebit:6.4,interest:0.6,tax:1.5,netIncome:4.3,ebitda:8.4},
      {m:"Jul",revenue:37.8,cogs:23.1,grossProfit:14.7,sgna:5.0,rnd:1.3,gna:1.8,da:1.9,ebit:4.7,interest:0.6,tax:1.0,netIncome:3.1,ebitda:6.6},
      {m:"Aug",revenue:36.2,cogs:22.1,grossProfit:14.1,sgna:4.8,rnd:1.2,gna:1.8,da:1.8,ebit:4.5,interest:0.6,tax:1.0,netIncome:2.9,ebitda:6.3},
      {m:"Sep",revenue:41.5,cogs:25.2,grossProfit:16.3,sgna:5.4,rnd:1.5,gna:2.0,da:1.9,ebit:5.5,interest:0.6,tax:1.2,netIncome:3.7,ebitda:7.4},
      {m:"Oct",revenue:44.8,cogs:27.0,grossProfit:17.8,sgna:5.8,rnd:1.6,gna:2.2,da:2.0,ebit:6.2,interest:0.6,tax:1.4,netIncome:4.2,ebitda:8.2},
      {m:"Nov",revenue:46.0,cogs:27.8,grossProfit:18.2,sgna:6.0,rnd:1.6,gna:2.2,da:2.0,ebit:6.4,interest:0.6,tax:1.5,netIncome:4.3,ebitda:8.4},
      {m:"Dec",revenue:49.5,cogs:29.8,grossProfit:19.7,sgna:6.5,rnd:1.8,gna:2.4,da:2.1,ebit:6.9,interest:0.6,tax:1.6,netIncome:4.7,ebitda:9.0}
    ],
    ytd: {revenue:109.3,cogs:67.0,grossProfit:42.3,sgna:14.5,rnd:3.6,gna:5.4,da:5.5,ebit:13.3,interest:1.8,tax:3.0,netIncome:8.5,ebitda:18.8,grossMargin:38.7,ebitdaMargin:17.2,ebitMargin:12.2,netMargin:7.8}
  },

  balanceSheet: {
    current: {
      cash:28.4, ar:62.3, inventory:44.1, prepayments:4.2, otherCurrent:3.1, totalCurrentAssets:142.1,
      ppe:118.6, intangibles:22.4, goodwill:35.0, investments:8.2, otherNonCurrent:5.3, totalNonCurrentAssets:189.5,
      totalAssets:331.6,
      ap:31.8, accruals:18.4, shortTermDebt:15.0, taxPayable:4.2, otherCurrentLiab:6.1, totalCurrentLiabilities:75.5,
      longTermDebt:133.0, deferredTax:8.2, provisions:4.4, totalNonCurrentLiabilities:145.6,
      totalLiabilities:221.1,
      shareCapital:50.0, retainedEarnings:55.1, otherReserves:5.4, totalEquity:110.5,
      totalLiabAndEquity:331.6
    },
    prior: {
      cash:26.1, ar:59.8, inventory:43.2, totalCurrentAssets:138.4,
      ppe:116.0, intangibles:22.8, goodwill:35.0, investments:8.1, otherNonCurrent:5.3, totalNonCurrentAssets:187.2,
      totalAssets:325.6,
      ap:30.5, accruals:17.9, shortTermDebt:16.0, taxPayable:3.9, otherCurrentLiab:4.8, totalCurrentLiabilities:73.1,
      longTermDebt:131.0, deferredTax:8.0, provisions:4.2, totalNonCurrentLiabilities:143.2,
      totalLiabilities:216.3,
      shareCapital:50.0, retainedEarnings:54.0, otherReserves:5.3, totalEquity:109.3,
      totalLiabAndEquity:325.6
    },
    trends: [
      {q:"Q2 24", assets:295.0, liabs:195.0, netDebt:135.0},
      {q:"Q3 24", assets:312.0, liabs:205.0, netDebt:128.0},
      {q:"Q4 24", assets:325.6, liabs:216.3, netDebt:120.9},
      {q:"Q1 25", assets:345.0, liabs:228.0, netDebt:112.0}
    ]
  },

  cashFlow: {
    ytd: {netIncome:13.0, da:6.1, wcChange:-5.2, otherOp:1.4, operatingCF:15.3,
          capex:-7.8, acquisitions:-2.5, disposals:1.2, investingCF:-9.1,
          debtRepayment:-4.5, dividends:-3.0, financingCF:-7.5,
          netCashChange:-1.3, freeCashFlow:7.5},
    quarterly: [
      {q:"Q2 24",operatingCF:14.2,investingCF:-8.5,financingCF:-3.8,fcf:5.7},
      {q:"Q3 24",operatingCF:16.8,investingCF:-7.2,financingCF:-4.5,fcf:9.6},
      {q:"Q4 24",operatingCF:19.5,investingCF:-10.3,financingCF:-5.2,fcf:9.2},
      {q:"Q1 25",operatingCF:15.3,investingCF:-9.1,financingCF:-7.5,fcf:7.5}
    ]
  },

  workingCapital: {
    current: {dso:52.3, dpo:38.1, dio:44.8, ccc:59.0, nwc:66.6, currentRatio:1.88, quickRatio:1.30},
    budget: {dso:48.0, dpo:40.0, dio:42.0, ccc:50.0},
    priorYear: {dso:49.2, dpo:37.5, dio:43.1, ccc:54.8},
    quarterly: [
      {q:"Q2 24",dso:42.0,dpo:40.5,dio:38.0,ccc:39.5},
      {q:"Q3 24",dso:46.5,dpo:38.0,dio:41.2,ccc:49.7},
      {q:"Q4 24",dso:49.8,dpo:39.2,dio:42.8,ccc:53.4},
      {q:"Q1 25",dso:55.0,dpo:36.5,dio:48.0,ccc:66.5}
    ],
    ar_aging: [
      {bucket:"Current",amount:28.4,pct:45.6},
      {bucket:"1–30d",amount:18.6,pct:29.9},
      {bucket:"31–60d",amount:9.2,pct:14.8},
      {bucket:"61–90d",amount:4.1,pct:6.6},
      {bucket:"90d+",amount:2.0,pct:3.2}
    ],
    ap_aging: [
      {bucket:"Current",amount:14.2,pct:44.7},
      {bucket:"1–30d",amount:10.8,pct:34.0},
      {bucket:"31–60d",amount:5.1,pct:16.0},
      {bucket:"61–90d",amount:1.5,pct:4.7},
      {bucket:"90d+",amount:0.2,pct:0.6}
    ],
    ar_customers: [
      {name:"Heidelberg Industrial",invoice:"INV-2025-0312",issued:"2025-02-01",due:"2025-03-03",days:28,amount:8.4,status:"Overdue"},
      {name:"Krause Maschinenbau",invoice:"INV-2025-0298",issued:"2025-01-15",due:"2025-02-14",days:45,amount:5.2,status:"Overdue"},
      {name:"Solvay Chemicals",invoice:"INV-2025-0334",issued:"2025-02-15",due:"2025-03-17",days:14,amount:3.8,status:"Overdue"},
      {name:"Renault SAS",invoice:"INV-2025-0287",issued:"2025-01-08",due:"2025-02-07",days:52,amount:4.1,status:"Escalated"},
      {name:"ArcelorMittal",invoice:"INV-2025-0301",issued:"2025-01-20",due:"2025-02-19",days:40,amount:6.3,status:"Overdue"},
      {name:"ThyssenKrupp",invoice:"INV-2025-0275",issued:"2024-12-20",due:"2025-01-19",days:71,amount:2.0,status:"Legal"}
    ],
    inventory: [
      {sku:"IND-RAW-001",category:"Raw Materials",opening:12.4,purchases:8.2,cogs:9.1,closing:11.5,daysCover:46,flag:"watch"},
      {sku:"IND-WIP-010",category:"Work in Progress",opening:8.1,purchases:4.2,cogs:5.3,closing:7.0,daysCover:48,flag:"watch"},
      {sku:"IND-FGD-022",category:"Finished Goods",opening:14.2,purchases:9.8,cogs:11.2,closing:12.8,daysCover:42,flag:"normal"},
      {sku:"SRV-PARTS-04",category:"Service Parts",opening:7.4,purchases:2.1,cogs:1.8,closing:7.7,daysCover:156,flag:"slow-mover"},
      {sku:"IND-PAC-008",category:"Packaging",opening:3.2,purchases:1.8,cogs:2.4,closing:2.6,daysCover:40,flag:"normal"},
      {sku:"IND-OBS-003",category:"Obsolete Stock",opening:2.8,purchases:0,cogs:0,closing:2.8,daysCover:999,flag:"obsolete"}
    ]
  },

  accruals: [
    {id:"PC-001",desc:"Monthly Payroll True-Up",cat:"Personnel",entity:"Consolidated",amount:1.42,basis:"Payroll system delta",owner:"HR Finance",jan:"Posted",feb:"Posted",mar:"Posted",notes:"Standard monthly run rate"},
    {id:"PC-002",desc:"Bonus Provision (Q1 est.)",cat:"Personnel",entity:"Consolidated",amount:0.68,basis:"33% of annual target",owner:"Controller",jan:"Posted",feb:"Posted",mar:"Pending",notes:"Awaiting final group multiplier approval"},
    {id:"PC-003",desc:"Overtime & Shift Premiums",cat:"Personnel",entity:"Div A",amount:0.22,basis:"Plant attendance logs",owner:"Plant Controller",jan:"Posted",feb:"Posted",mar:"Posted",notes:"Industrial night shifts"},
    {id:"PC-004",desc:"Executive Long-Term Incentive",cat:"Personnel",entity:"HQ",amount:0.15,basis:"Remuneration committee table",owner:"Group HR",jan:"Posted",feb:"Posted",mar:"Review",notes:"Vesting calculation update"},
    {id:"PR-001",desc:"HQ Office Lease & Utilities",cat:"Premises",entity:"HQ",amount:0.45,basis:"Lease indexation clause",owner:"Facilities",jan:"Posted",feb:"Posted",mar:"Posted",notes:"Contract renewed in Dec"},
    {id:"PR-002",desc:"Div A Plant Energy Accrual",cat:"Premises",entity:"Div A",amount:0.58,basis:"Grid metering estimated delta",owner:"Ops Finance",jan:"Posted",feb:"Posted",mar:"Pending",notes:"EDF unbilled spot consumption"},
    {id:"PR-003",desc:"Div B Service Depots Rent",cat:"Premises",entity:"Div B",amount:0.18,basis:"Commercial leases (12 sites)",owner:"Div B Finance",jan:"Posted",feb:"Posted",mar:"Posted",notes:"Quarterly true-up confirmed"},
    {id:"CM-001",desc:"Customer Volume Rebates",cat:"Commercial",entity:"Div A",amount:0.34,basis:"2.1% of Div A revenue",owner:"Sales Finance",jan:"Posted",feb:"Posted",mar:"Posted",notes:"Key account contractual terms"},
    {id:"CM-002",desc:"Distributor Marketing Allowances",cat:"Commercial",entity:"Div A",amount:0.25,basis:"Approved co-op claims",owner:"Commercial Mgr",jan:"Posted",feb:"Posted",mar:"Review",notes:"Proof of performance pending"},
    {id:"CM-003",desc:"Agent Commissions — Export",cat:"Commercial",entity:"Div B",amount:0.16,basis:"3.5% on closed orders",owner:"Sales Ops",jan:"Posted",feb:"Posted",mar:"Posted",notes:"MENA agent portfolio"},
    {id:"OP-001",desc:"Outsourced Plant Maintenance",cat:"Operations",entity:"Div A",amount:0.38,basis:"Service contract SLA",owner:"Maintenance Dir",jan:"Posted",feb:"Posted",mar:"Posted",notes:"Scheduled preventive cycle"},
    {id:"OP-002",desc:"Inbound Freight & Logistics",cat:"Operations",entity:"Div A",amount:0.29,basis:"Carrier manifests pending",owner:"Supply Chain",jan:"Posted",feb:"Posted",mar:"Pending",notes:"DHL/Kuehne ocean freight"},
    {id:"OP-003",desc:"IT Cloud Hosting & SaaS True-up",cat:"Operations",entity:"HQ",amount:0.14,basis:"AWS consumption metrics",owner:"IT Controller",jan:"Posted",feb:"Posted",mar:"Posted",notes:"Reserved instances applied"},
    {id:"FN-001",desc:"Interest Accrual — Term Loan A",cat:"Finance",entity:"HQ",amount:0.12,basis:"E+185bps x €80M",owner:"Treasury",jan:"Posted",feb:"Posted",mar:"Posted",notes:"Quarterly fix verified"},
    {id:"FN-002",desc:"RCF Commitment & Facility Fees",cat:"Finance",entity:"HQ",amount:0.06,basis:"45bps on undrawn tranche",owner:"Treasury",jan:"Posted",feb:"Posted",mar:"Posted",notes:"Syndicate calculation"},
    {id:"FN-003",desc:"Bank Charges & Guarantees",cat:"Finance",entity:"Div A",amount:0.04,basis:"Letter of credit ledger",owner:"Treasury",jan:"Posted",feb:"Posted",mar:"Posted",notes:"Performance bonds active"},
    {id:"PV-001",desc:"Warranty Provision",cat:"Provisions",entity:"Div A",amount:0.18,basis:"0.45% of Div A revenue",owner:"Ops Finance",jan:"Posted",feb:"Posted",mar:"Review",notes:"Failure rate curve evaluation"},
    {id:"PV-002",desc:"Restructuring Severance",cat:"Provisions",entity:"Div B",amount:0.35,basis:"Social plan consultation",owner:"HR Finance",jan:"Posted",feb:"Posted",mar:"Pending",notes:"Legal final agreement pending"},
    {id:"PV-003",desc:"Environmental Site Remediation",cat:"Provisions",entity:"Div A",amount:0.10,basis:"Expert technical assessment",owner:"Legal/Controller",jan:"Posted",feb:"Posted",mar:"Not Required",notes:"Re-evaluated in Q4 24"}
  ],

  forecastAccuracy: {
    months: [
      { m: "Oct 24", forecastRevenue: 50.0, actualRevenue: 54.2, forecastEbitda: 10.5, actualEbitda: 11.8, forecastNetIncome: 5.8, actualNetIncome: 6.6 },
      { m: "Nov 24", forecastRevenue: 54.0, actualRevenue: 56.8, forecastEbitda: 11.2, actualEbitda: 12.4, forecastNetIncome: 6.2, actualNetIncome: 7.0 },
      { m: "Dec 24", forecastRevenue: 58.0, actualRevenue: 62.0, forecastEbitda: 12.0, actualEbitda: 13.8, forecastNetIncome: 6.8, actualNetIncome: 8.0 },
      { m: "Jan 25", forecastRevenue: 44.0, actualRevenue: 42.5, forecastEbitda: 9.0, actualEbitda: 8.7, forecastNetIncome: 4.8, actualNetIncome: 4.5 },
      { m: "Feb 25", forecastRevenue: 41.0, actualRevenue: 39.8, forecastEbitda: 8.5, actualEbitda: 7.7, forecastNetIncome: 4.2, actualNetIncome: 3.7 },
      { m: "Mar 25", forecastRevenue: 48.5, actualRevenue: 46.2, forecastEbitda: 10.2, actualEbitda: 9.2, forecastNetIncome: 5.6, actualNetIncome: 4.8 }
    ]
  },

  interco: {
    entities: ["HQ (Group SA)", "Div A (Industrial)", "Div B (Services)", "Finance SAS"],
    matrix: [
      { from: "Div A (Industrial)", to: "Div B (Services)", type: "Interco Sales", amountFrom: 4.20, amountTo: 4.20, difference: 0.00, status: "matched", notes: "Standard finished sub-assembly goods delivery." },
      { from: "HQ (Group SA)", to: "Div A (Industrial)", type: "Management Fees", amountFrom: 1.85, amountTo: 1.83, difference: 0.02, status: "gap", notes: "Q1 true-up rounding on shared IT charge-back allocation." },
      { from: "Finance SAS", to: "Div A (Industrial)", type: "Interco Loan Interest", amountFrom: 0.48, amountTo: 0.48, difference: 0.00, status: "matched", notes: "Q1 loan tranche fixed interest settled." },
      { from: "Finance SAS", to: "Div B (Services)", type: "Interco Loan Interest", amountFrom: 0.22, amountTo: 0.19, difference: 0.03, status: "gap", notes: "Withholding tax deduction disputed by Div B local accountants." },
      { from: "HQ (Group SA)", to: "Div B (Services)", type: "Management Fees", amountFrom: 0.72, amountTo: 0.72, difference: 0.00, status: "matched", notes: "Corporate executive overhead recharge." },
      { from: "Div A (Industrial)", to: "HQ (Group SA)", type: "Dividend Accrual", amountFrom: 2.00, amountTo: 2.00, difference: 0.00, status: "matched", notes: "Interim FY24 dividend distribution authorized by Board." },
      { from: "Finance SAS", to: "HQ (Group SA)", type: "Treasury Transfer", amountFrom: 5.50, amountTo: 0.00, difference: 5.50, status: "missing", notes: "Swept pooling balance not booked by HQ accounting before cut-off." }
    ]
  },

  costCenters: [
    {id:"div-a",name:"Division A — Industrial",actual:92.5,budget:105.0,variance:-12.5,varPct:-11.9,fte:1821,budgetFte:1920,rag:"red",
     children:[
       {id:"dept-a1",name:"Sales & BD",actual:18.5,budget:15.0,variance:3.5,varPct:23.3,fte:165,budgetFte:150,rag:"red"},
       {id:"dept-a2",name:"Operations",actual:52.0,budget:62.0,variance:-10.0,varPct:-16.1,fte:1380,budgetFte:1480,rag:"red"},
       {id:"dept-a3",name:"Engineering",actual:22.0,budget:28.0,variance:-6.0,varPct:-21.4,fte:276,budgetFte:290,rag:"red"}
     ]
    },
    {id:"div-b",name:"Division B — Services",actual:38.0,budget:42.0,variance:-4.0,varPct:-9.5,fte:890,budgetFte:940,rag:"amber",
     children:[
       {id:"dept-b1",name:"Field Services",actual:24.5,budget:28.0,variance:-3.5,varPct:-12.5,fte:612,budgetFte:650,rag:"red"},
       {id:"dept-b2",name:"Digital Solutions",actual:13.5,budget:14.0,variance:-0.5,varPct:-3.6,fte:278,budgetFte:290,rag:"amber"}
     ]
    },
    {id:"hq",name:"HQ / Corporate",actual:8.5,budget:9.0,variance:-0.5,varPct:-5.6,fte:136,budgetFte:140,rag:"green",
     children:[
       {id:"dept-h1",name:"Finance & Control",actual:3.5,budget:3.8,variance:-0.3,varPct:-7.9,fte:48,budgetFte:48,rag:"green"},
       {id:"dept-h2",name:"HR & Legal",actual:2.8,budget:3.0,variance:-0.2,varPct:-6.7,fte:52,budgetFte:54,rag:"green"},
       {id:"dept-h3",name:"IT & Systems",actual:2.2,budget:2.2,variance:0.0,varPct:0.0,fte:36,budgetFte:38,rag:"green"}
     ]
    }
  ],
  headcount: {actual:2847,budget:2900,priorYear:2791,variance:-53,vacancies:12},
  debt: {
    facilities: [
      {name:"Term Loan A",lender:"BNP Paribas",drawn:95.0,limit:95.0,available:0.0,rate:"E+185bps",maturity:"Dec 2027",status:"Active",maturityYear:2027},
      {name:"RCF",lender:"Syndicate",drawn:65.0,limit:120.0,available:55.0,rate:"E+165bps",maturity:"Jun 2026",status:"Active",maturityYear:2026},
      {name:"Schuldscheindarlehen",lender:"DZ Bank",drawn:28.0,limit:28.0,available:0.0,rate:"3.45%",maturity:"Mar 2028",status:"Active",maturityYear:2028}
    ],
    covenants: [
      {name:"Net Debt / EBITDA",threshold:"≤ 3.0x",actual:1.83,headroom:"1.17x",status:"green",thresholdVal:3.0},
      {name:"Interest Coverage",threshold:"≥ 3.0x",actual:4.11,headroom:"1.11x",status:"green",thresholdVal:3.0},
      {name:"Min. Liquidity",threshold:"≥ €50M",actual:75.4,headroom:"€25.4M",status:"green",thresholdVal:50}
    ],
    netDebt:119.6,netDebtEbitda:1.83
  },
  forecast: {
    base: [
      {m:"Apr",revenue:40.2,ebitda:5.4,netIncome:2.1,editable:true},
      {m:"May",revenue:41.5,ebitda:5.6,netIncome:2.2,editable:true},
      {m:"Jun",revenue:43.0,ebitda:5.8,netIncome:2.3,editable:true},
      {m:"Jul",revenue:39.5,ebitda:5.3,netIncome:2.1,editable:true},
      {m:"Aug",revenue:38.5,ebitda:5.2,netIncome:2.0,editable:true},
      {m:"Sep",revenue:41.5,ebitda:5.6,netIncome:2.2,editable:true}
    ],
    drivers: {volumeGrowth:0,priceChange:0,opexInflation:0,fxRate:1.0}
  },
  alerts: [
    {id:1,severity:"HIGH",title:"Revenue Miss — March 2025",
     what:"Revenue €46.2M vs budget €48.0M (–€1.8M, –3.8%). YTD gap widened to –€7.5M.",
     why:"Volume shortfall in Division A Industrial segment (–€12.5M YTD). Delayed Heidelberg order and supply chain disruption in Q1.",
     action:"Sales review Apr 4. Recovery plan targets €8.0M catch-up in Q2 via accelerated order book and new contract pipeline.",
     status:"Open"},
    {id:2,severity:"HIGH",title:"EBITDA Margin Compression",
     what:"YTD EBITDA margin 19.9% vs 20.7% budget (–80bps) and 17.2% PY (+270bps YoY)",
     why:"Revenue miss on fixed-cost base. SG&A over-run €3.5M in Sales & BD vs plan. Materials inflation +1.8pp in COGS mix.",
     action:"OpEx freeze enacted Mar 15. Hiring hold on 12 positions. H2 price increase planned (+3.5%).",
     status:"In Review"},
    {id:3,severity:"MEDIUM",title:"Cash Conversion Cycle Deterioration",
     what:"CCC 66.5d vs 39.5d in Q2'24 (+27d). DSO 55.0d vs 42.0d target (+13d). Cash impact: €12.8M incremental WC.",
     why:"Two large customers extended payment to 90d terms. Inventory build-up for H2 product launch.",
     action:"Credit control escalation. Legal review of Renault & ArcelorMittal terms. Inventory reduction plan initiated.",
     status:"Open"},
    {id:4,severity:"POSITIVE",title:"Headcount Under-Budget & YoY Growth",
     what:"2,847 FTEs vs 2,900 budget (–53). Revenue per FTE up 17.5% YoY.",
     why:"Recruitment slower than planned. 12 positions open but productivity gains exceed targets.",
     action:"No action needed. Savings absorbed into OpEx buffer for H2 digital transformation initiative.",
     status:"Resolved"}
  ],

  closeChecklist: [
    {group:"Pre-Close", items:[
      {id:"pc1", task:"AP cutoff — all supplier invoices posted", owner:"AP Team", due:"Apr 1", status:"Complete", blockedBy:[], notes:"Cutoff 18:00 Apr 1 finalized"},
      {id:"pc2", task:"AR cutoff — all customer invoices raised", owner:"AR Team", due:"Apr 1", status:"Complete", blockedBy:[], notes:"Billing run completed"},
      {id:"pc3", task:"Inventory count reconciliation", owner:"Ops Finance", due:"Apr 2", status:"Complete", blockedBy:["pc1","pc2"], notes:"Physical to ERP matched"},
      {id:"pc4", task:"Payroll accruals posted", owner:"HR Finance", due:"Apr 2", status:"Complete", blockedBy:[], notes:"Bonus & true-ups posted"}
    ]},
    {group:"Close", items:[
      {id:"cl1", task:"Manual journal entries reviewed & posted", owner:"Controller", due:"Apr 3", status:"Complete", blockedBy:["pc4"], notes:"Reviewed by Sr Controller"},
      {id:"cl2", task:"Intercompany elimination entries", owner:"Group Finance", due:"Apr 3", status:"In Progress", blockedBy:["cl1"], notes:"Resolving €5.5M treasury transfer"},
      {id:"cl3", task:"Cost center allocations", owner:"Controller", due:"Apr 4", status:"Not Started", blockedBy:["cl2"], notes:"Blocked until Interco elimination"},
      {id:"cl4", task:"Trial balance reviewed — zero unallocated", owner:"Controller", due:"Apr 4", status:"Not Started", blockedBy:["cl3"], notes:"Awaiting cost allocations"}
    ]},
    {group:"Reporting", items:[
      {id:"rp1", task:"Management pack draft", owner:"FP&A", due:"Apr 7", status:"Not Started", blockedBy:["cl4"], notes:"Initial flash draft"},
      {id:"rp2", task:"Budget vs Actuals commentary", owner:"Controller", due:"Apr 7", status:"Not Started", blockedBy:["rp1"], notes:"P&L variances draft"},
      {id:"rp5", task:"Working capital flash report to treasury", owner:"Controller", due:"Apr 5", status:"Not Started", blockedBy:["cl4"], notes:"Liquidity review"},
      {id:"rp6", task:"Cost center actual vs budget distributed to dept heads", owner:"FP&A", due:"Apr 8", status:"Not Started", blockedBy:["rp1"], notes:"Monthly reviews"},
      {id:"rp3", task:"Board pack slides", owner:"CFO Office", due:"Apr 9", status:"Not Started", blockedBy:["rp2"], notes:"Executive deck presentation"},
      {id:"rp4", task:"Audit trail documented", owner:"Controller", due:"Apr 9", status:"Not Started", blockedBy:["rp2"], notes:"Key controls sign-off sheet"}
    ]},
    {group:"Sign-Off", items:[
      {id:"so1", task:"Controller sign-off", owner:"Controller", due:"Apr 10", status:"Not Started", blockedBy:["rp3","rp4"], notes:"Final reconciliation sign-off"},
      {id:"so2", task:"CFO approval", owner:"CFO", due:"Apr 10", status:"Not Started", blockedBy:["so1"], notes:"Executive sign-off"},
      {id:"so3", task:"Submission to Group Finance", owner:"Controller", due:"Apr 11", status:"Not Started", blockedBy:["so2"], notes:"Official consolidation upload"},
      {id:"so4", task:"ERP period lock — March 2025 posting period closed", owner:"IT Finance", due:"Apr 11", status:"Not Started", blockedBy:["so1"], notes:"System cut-off lock"},
      {id:"so5", task:"Statutory reporting packs distributed", owner:"Group Finance", due:"Apr 14", status:"Not Started", blockedBy:["so2"], notes:"Local filings"}
    ]}
  ]
};

// Derived metrics helper
function recomputeDerived() {
  const d = window.NEXOVA_DATA;
  d.derived = {
    revenueVsBudgetAbs: d.actuals.ytd.revenue - d.budget.ytd.revenue,
    revenueVsBudgetPct: ((d.actuals.ytd.revenue - d.budget.ytd.revenue) / d.budget.ytd.revenue * 100),
    ebitdaVsBudgetAbs: d.actuals.ytd.ebitda - d.budget.ytd.ebitda,
    headcountVsBudget: d.headcount.actual - d.headcount.budget,
    nwc: d.balanceSheet.current.totalCurrentAssets - d.balanceSheet.current.totalCurrentLiabilities,
    balanceCheck: Math.abs(d.balanceSheet.current.totalAssets - d.balanceSheet.current.totalLiabAndEquity) < 0.01
  };
}
recomputeDerived();

// Period Slicing Helper
function getDataSlice(period) {
  const d = window.NEXOVA_DATA;
  const p = (period || STATE.period || 'ytd').toLowerCase();
  
  if (p === 'mtd') {
    const act = d.actuals.monthly[2] || d.actuals.monthly[d.actuals.monthly.length - 1];
    const bdg = d.budget.monthly[2] || d.budget.monthly[d.budget.monthly.length - 1];
    const py = d.priorYear.monthly[2] || d.priorYear.monthly[d.priorYear.monthly.length - 1];
    return {
      periodLabel: "March 2025 (MTD)",
      actual: {
        revenue: act.revenue, cogs: act.cogs, grossProfit: act.grossProfit, sgna: act.sgna, rnd: act.rnd, gna: act.gna,
        da: act.da, ebit: act.ebit, interest: act.interest, tax: act.tax, netIncome: act.netIncome, ebitda: act.ebitda,
        fcf: act.fcf || 1.0, grossMargin: (act.grossProfit/act.revenue)*100, ebitdaMargin: (act.ebitda/act.revenue)*100,
        ebitMargin: (act.ebit/act.revenue)*100, netMargin: (act.netIncome/act.revenue)*100
      },
      budget: {
        revenue: bdg.revenue, cogs: bdg.cogs || 24.5, grossProfit: bdg.grossProfit || 15.5, sgna: bdg.sgna || 5.9, rnd: bdg.rnd || 1.2, gna: bdg.gna || 2.0,
        da: bdg.da || 1.8, ebit: bdg.ebit || 4.6, interest: bdg.interest || 0.6, tax: bdg.tax || 1.0, netIncome: bdg.netIncome || 3.0, ebitda: bdg.ebitda,
        grossMargin: 38.7, ebitdaMargin: 13.8, ebitMargin: 11.5, netMargin: 7.5
      },
      priorYear: {
        revenue: py.revenue, cogs: py.cogs || 22.9, grossProfit: py.grossProfit || 14.0, ebitda: py.ebitda, netIncome: py.netIncome || 2.0,
        grossMargin: 37.9, ebitdaMargin: 14.1, ebitMargin: 8.9, netMargin: 5.4
      }
    };
  } else if (p === 'qtd') {
    const actM = d.actuals.monthly.slice(0, 3);
    const bdgM = d.budget.monthly.slice(0, 3);
    const pyM = d.priorYear.monthly.slice(0, 3);
    
    const sum = (arr, key) => arr.reduce((acc, x) => acc + (x[key] || 0), 0);
    const actRev = sum(actM, 'revenue');
    const actGp = sum(actM, 'grossProfit');
    const actEb = sum(actM, 'ebitda');
    const actEbit = sum(actM, 'ebit');
    const actNi = sum(actM, 'netIncome');
    
    const bdgRev = sum(bdgM, 'revenue');
    const bdgEb = sum(bdgM, 'ebitda');
    const pyRev = sum(pyM, 'revenue');
    const pyEb = sum(pyM, 'ebitda');

    return {
      periodLabel: "Q1 2025 (QTD)",
      actual: {
        revenue: actRev, cogs: sum(actM, 'cogs'), grossProfit: actGp, sgna: sum(actM, 'sgna'), rnd: sum(actM, 'rnd'), gna: sum(actM, 'gna'),
        da: sum(actM, 'da'), ebit: actEbit, interest: sum(actM, 'interest'), tax: sum(actM, 'tax'), netIncome: actNi, ebitda: actEb,
        fcf: sum(actM, 'fcf'), grossMargin: (actGp/actRev)*100, ebitdaMargin: (actEb/actRev)*100, ebitMargin: (actEbit/actRev)*100, netMargin: (actNi/actRev)*100
      },
      budget: {
        revenue: bdgRev, cogs: d.budget.ytd.cogs, grossProfit: d.budget.ytd.grossProfit, sgna: d.budget.ytd.sgna, rnd: d.budget.ytd.rnd, gna: d.budget.ytd.gna,
        da: d.budget.ytd.da, ebit: d.budget.ytd.ebit, interest: d.budget.ytd.interest, tax: d.budget.ytd.tax, netIncome: d.budget.ytd.netIncome, ebitda: bdgEb,
        grossMargin: d.budget.ytd.grossMargin, ebitdaMargin: d.budget.ytd.ebitdaMargin, ebitMargin: d.budget.ytd.ebitMargin, netMargin: d.budget.ytd.netMargin
      },
      priorYear: {
        revenue: pyRev, ebitda: pyEb, netIncome: d.priorYear.ytd.netIncome,
        grossMargin: d.priorYear.ytd.grossMargin, ebitdaMargin: d.priorYear.ytd.ebitdaMargin
      }
    };
  } else if (p === 'annual') {
    const fy = d.budget.fullYear;
    return {
      periodLabel: "Full Year FY2025 Target",
      actual: {
        revenue: d.actuals.ytd.revenue + (fy.revenue - d.budget.ytd.revenue),
        cogs: d.actuals.ytd.cogs + (fy.cogs - d.budget.ytd.cogs),
        grossProfit: d.actuals.ytd.grossProfit + (fy.grossProfit - d.budget.ytd.grossProfit),
        sgna: d.actuals.ytd.sgna + (fy.sgna - d.budget.ytd.sgna),
        rnd: d.actuals.ytd.rnd + (fy.rnd - d.budget.ytd.rnd),
        gna: d.actuals.ytd.gna + (fy.gna - d.budget.ytd.gna),
        da: d.actuals.ytd.da + (fy.da - d.budget.ytd.da),
        ebit: d.actuals.ytd.ebit + (fy.ebit - d.budget.ytd.ebit),
        interest: d.actuals.ytd.interest + (fy.interest - d.budget.ytd.interest),
        tax: d.actuals.ytd.tax + (fy.tax - d.budget.ytd.tax),
        netIncome: d.actuals.ytd.netIncome + (fy.netIncome - d.budget.ytd.netIncome),
        ebitda: d.actuals.ytd.ebitda + (fy.ebitda - d.budget.ytd.ebitda),
        fcf: 18.2, grossMargin: 38.0, ebitdaMargin: 14.5, ebitMargin: 10.5, netMargin: 5.8
      },
      budget: {
        revenue: fy.revenue, cogs: fy.cogs, grossProfit: fy.grossProfit, sgna: fy.sgna, rnd: fy.rnd, gna: fy.gna,
        da: fy.da, ebit: fy.ebit, interest: fy.interest, tax: fy.tax, netIncome: fy.netIncome, ebitda: fy.ebitda,
        grossMargin: fy.grossMargin, ebitdaMargin: fy.ebitdaMargin, ebitMargin: 11.1, netMargin: 6.0
      },
      priorYear: {
        revenue: 450.0, ebitda: 68.0, netIncome: 26.5, grossMargin: 38.2, ebitdaMargin: 15.1
      }
    };
  }

  // Default: YTD (Jan-Mar)
  return {
    periodLabel: "March 2025 YTD",
    actual: d.actuals.ytd,
    budget: d.budget.ytd,
    priorYear: d.priorYear.ytd
  };
}

