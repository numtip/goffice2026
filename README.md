# 🌱 Green Office Platform 2569+

A modern, performant environmental dashboard platform for Thailand's Green Office 2569+ certification. Track and report on key sustainability metrics with ease.

## 📊 Overview

The Green Office Platform is a **static-first environmental data portal** designed to:
- 📈 Track 6 core environmental metrics (energy, water, fuel, paper, waste, GHG emissions)
- 🎖️ Assess compliance against Thailand's Green Office 2569 criteria
- 📚 Maintain an evidence library for certification documentation
- 🚀 Deliver fast-loading, maintainable, and user-friendly dashboards

**Philosophy:** Simplicity, speed, maintainability, and usability over technology complexity.

---

## 🎯 Key Features

### 1. **Environmental Dashboard**
- Multi-year metrics comparison (baseline year 2568 + current year 2569)
- Year-over-year trend analysis
- KPI tracking across 7 Green Office categories
- Interactive sparklines and data tables

### 2. **Seven Green Office Categories**
| Category | Focus Area | Current Score |
|----------|-----------|---|
| 1️⃣ Energy Management | Electricity efficiency, LED adoption | 85% |
| 2️⃣ Water Management | Water metering, conservation | 78% |
| 3️⃣ Waste Management | Segregation, recycling, diversion | 92% |
| 4️⃣ GHG Emissions | Scope 1 & 2 tracking | 71% |
| 5️⃣ Indoor Environmental Quality | Air, lighting, noise, comfort | 88% |
| 6️⃣ Transportation | Sustainable transport, fuel efficiency | 74% |
| 7️⃣ Innovation | Green initiatives, best practices | 80% |

### 3. **Evidence Library**
- Compliance documentation repository
- Category-specific evidence organization
- Search and discovery functionality

### 4. **Data Management**
- CSV-based data import (no database required in MVP)
- Automated validation and JSON generation
- Multi-year historical tracking

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Astro | 4.0.0 | Static Site Generation (SSG) |
| **Styling** | Tailwind CSS | 3.4.0 | Utility-first CSS framework |
| **Language** | TypeScript | 5.4.0+ | Type-safe development |
| **Build Tools** | PostCSS, Autoprefixer | Latest | CSS processing |
| **Design** | Dyad | — | UI prototyping |
| **Data** | CSV, JSON, Markdown | — | Static data sources |
| **Deployment** | Linux VPS + Nginx | — | Production hosting |

### Design Principles
✅ **Static First** — Markdown/JSON/CSV before databases  
✅ **Performance First** — Every decision considers load speed  
✅ **Content First** — Content prioritized over technology  
✅ **Simple First** — Simplest working solution  
✅ **Maintainability First** — Future staff must understand  

---

## 📁 Project Structure

```
goffice2026/
├── src/
│   ├── pages/                 # Route pages (dashboard, evidence, documents, search)
│   │   ├── dashboard.astro    # Main metrics dashboard
│   │   ├── evidence.astro     # Evidence library
│   │   ├── documents.astro    # Public documents
│   │   ├── search.astro       # Global search
│   │   └── categories/        # Category-specific pages
│   │
│   ├── components/            # Reusable Astro components
│   │   ├── dashboard/         # KPI cards, data tables, sparklines
│   │   ├── evidence/          # Evidence cards
│   │   └── ui/                # Navigation, layouts
│   │
│   ├── layouts/               # Page templates
│   │   └── BaseLayout.astro   # Master layout
│   │
│   ├── data/                  # Configuration and static data
│   │   ├── dashboard-config.ts
│   │   ├── dashboard-kpi.json
│   │   ├── categories.json
│   │   ├── csv/               # Raw CSV data files
│   │   └── generated/         # Build-time JSON output
│   │
│   ├── utils/                 # Utilities
│   │   ├── parse-csv.ts       # Zero-dependency CSV parser
│   │   └── multi-year-schema.ts # Type definitions & YoY calculations
│   │
│   └── styles/                # Global CSS
│
├── data/
│   ├── csv/                   # Sample data files
│   ├── import/                # CSV imports (2569 current year)
│   │   ├── energy-2569.csv
│   │   ├── water-2569.csv
│   │   └── templates/         # Import templates
│   └── json/                  # Navigation config
│
├── docs/                      # Documentation
│   ├── architecture/          # Architecture overview
│   ├── context-packs/         # Context for different roles
│   ├── KB/                    # Knowledge base
│   └── runbooks/              # Operational procedures
│
├── scripts/                   # Automation scripts
│   ├── data-validator.mjs     # CSV validation
│   └── import-dashboard-data.mjs # Data import pipeline
│
├── public/                    # Static assets
│   └── documents/             # Public documents by category
│
├── astro.config.mjs           # Astro configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.mjs        # Tailwind CSS configuration
└── package.json               # Dependencies & scripts
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Git
- Text editor (VS Code recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/numtip/goffice2026.git
cd goffice2026

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
# Open http://localhost:3000 in your browser

# Type checking
npm run check

# Build for production
npm run build

# Preview production build
npm run preview
```

### Data Management

```bash
# Import CSV data and generate JSON
npm run import:data
# Validates CSV files and generates src/data/generated/*.json

# Validate data integrity
npm run validate:data
```

---

## 📊 Data Model

### Metric Schema

Each environmental metric follows the **MultiYearMetric** structure:

```typescript
{
  metric: "energy" | "water" | "fuel" | "paper" | "waste" | "ghg",
  label: "Energy Consumption",
  unit: "kWh",
  kpiField: "energyKpi",
  baselineYear: 2568,
  currentYear: 2569,
  years: [
    {
      year: 2568,
      isBaseline: true,
      dataStatus: "complete" | "in_progress" | "missing",
      source: "filename.csv",
      updated: "2025-12-31T00:00:00Z",
      months: [1200, 1150, ...],  // Jan-Dec values
      total: 14000,
      average: 1167
    },
    // ... current year data
  ],
  yoyChange: {
    absolute: -500,
    percentage: -3.5,
    trend: "improving" | "stable" | "declining"
  }
}
```

### Data Flow Pipeline

```
Excel Files (Manual)
    ↓
CSV Conversion (data/import/)
    ↓
Validation (scripts/data-validator.mjs)
    ↓
JSON Generation (src/data/generated/)
    ↓
Build-time Import
    ↓
Static HTML Pages (Production)
```

---

## 📋 Baseline Data Status (2568)

✅ **Complete** (12 months each):
- Energy (kWh)
- Water (m³)
- Fuel (L)
- Paper (kg)
- Waste (kg)
- GHG Emissions (tCO₂e)

📈 **Current Year (2569)**: In progress as of 2026-06-15

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE_OVERVIEW.md](docs/architecture/ARCHITECTURE_OVERVIEW.md) | System design & decision rationale |
| [DATA_FLOW.md](docs/architecture/DATA_FLOW.md) | Data pipeline documentation |
| [GREENOFFICE_DASHBOARD_SPEC.md](docs/KB/GREENOFFICE_DASHBOARD_SPEC.md) | Dashboard requirements & features |
| [RTK_USAGE.md](docs/runbooks/RTK_USAGE.md) | Real-time token knowledge usage |
| [BUILD_VERIFICATION.md](docs/runbooks/BUILD_VERIFICATION.md) | Pre-push verification checklist |
| [RELEASE_SAFETY_CHECK.md](docs/runbooks/RELEASE_SAFETY_CHECK.md) | Production release procedure |

---

## ✅ Pre-Push Checklist

Before pushing code to main:

```bash
# 1. Verify git status
git status  # Should be clean

# 2. Run type checking
npm run check

# 3. Build production
npm run build

# 4. Preview build
npm run preview
# Test routes manually in browser

# 5. Verify data integrity
npm run validate:data

# 6. Review runbooks
# - docs/runbooks/BUILD_VERIFICATION.md
# - docs/runbooks/RUNTIME_QA.md
# - docs/runbooks/RELEASE_SAFETY_CHECK.md
```

---

## 🎯 Current Status

- **Version:** 0.1.0 (MVP)
- **Release Date:** 2026-06-15
- **Status:** Active Development
- **Latest Updates:** 2026-06-12

### What's Included
✅ Core platform infrastructure  
✅ Multi-year data schema (2568 baseline complete)  
✅ CSV/JSON data pipeline  
✅ Dashboard KPI configuration  
✅ Seven category structure  
✅ Component library (cards, tables, sparklines)  
✅ Documentation suite  

### Not in MVP
❌ Backend/API (static only)  
❌ Database (CSV/JSON files)  
❌ User authentication  
❌ Real-time data  
❌ Production deployment (pending PO approval)  

---

## 👥 Governance

**Key Roles:**
- **PO (Product Owner):** Strategic vision & final approval
- **Architecture Review:** Technical decision oversight
- **Developers:** Implementation & day-to-day execution

**No force-push to main without approval.** All changes require verification via runbooks.

---

## 🔗 Links

- **GitHub Repository:** https://github.com/numtip/goffice2026
- **Local Path:** `/mnt/g/ProjectAI/goffice2026`
- **Green Office 2569 Criteria:** See [2026 Green Office Assessment Criteria.MD](2026%20Green%20Office%20Assessment%20Criteria.MD)

---

## 📄 License

[Add license information as needed]

---

## 🤝 Contributing

When contributing to this project:

1. **Review** the architecture documentation
2. **Follow** the pre-push checklist
3. **Run** all verification commands
4. **Test** in production preview mode
5. **Await** PO approval before merge

---

## 📞 Support

For questions or issues:
- Check [docs/](docs/) for comprehensive documentation
- Review [docs/KB/](docs/KB/) knowledge base
- Consult [docs/runbooks/](docs/runbooks/) for operational guidance

---

**Last Updated:** 2026-06-15  
**Platform Version:** 0.1.0 (MVP)  
**Made with 🌱 for sustainable operations**