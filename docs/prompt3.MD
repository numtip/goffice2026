# SPRINT: GO-DATA-1 — Environmental Data Pipeline Consolidation

Repository:
G:\ProjectAI\goffice2026

Branch:
master

Execution model:
- Head Agent: DeepSeek-V4-Pro
- Workers: DeepSeek-V4-Flash
- Head Agent owns architecture decisions, integration, validation, Git operations,
  and the final report.
- Workers may inspect independent datasets in parallel.
- Do not allow multiple workers to modify the same files concurrently.

Primary references, in authority order:
1. docs/project/GREENOFFICE2026_PLATFORM_BLUEPRINT_V3.md
2. docs/project/GOFFICE2026_CONTENT_ARCHITECTURE_V2.md
3. GOFFICE2026_NEW_PROJECT_MASTER_REFERENCE.md
4. Official Green Office 2569 criteria
5. Current repository implementation

Project principles:
- Reuse Before Build
- Static First
- One Source, Many Views
- Evidence First
- Preserve working routes
- No production deployment
- GitHub repository is the Source of Truth

Token-efficiency rules:
- Use RTK, context-mode, Token Savior, targeted reads, and bounded output.
- Inspect filenames and focused code ranges before reading large files.
- Do not reload complete reference documents when their relevant requirements
  are already known.
- Summarize findings before implementation.
- Avoid dumping full Excel contents or generated JSON into chat output.

Available source files:
- 1.1-Water.xlsx
- 12-elect.xlsx
- 1.3_Gassolene.xlsx
- 1.4_Paper.xlsx
- 1.5_Waste.xlsx
- 1.5_GreenhouseGas.xlsx

Likely source location:
F:\projectAi\goffice2026\docs\Resource

Also check whether equivalent or newer copies already exist inside:
G:\ProjectAI\goffice2026

Known validated annual values for cross-checking, not for hardcoding:
- Water 2568: 8,337.5 m³
- Electricity 2568: 403,036.8 kWh
- Fuel 2568: 339.83 L
- Paper 2568: 2,197 units/relevant source unit

Do not assume Waste or GHG totals.
Derive them from source files and document the calculation basis.

--------------------------------------------------
GOAL
--------------------------------------------------

Establish one reliable, validated, maintainable environmental-data pipeline
covering:

1. Water
2. Electricity
3. Fuel
4. Paper
5. Waste
6. Greenhouse Gas

The result must provide canonical generated data that can be reused by:

- Homepage KPI preview
- Executive Dashboard
- Metric Dashboard pages
- Thai and English routes
- Related indicator pages
- Future evidence traceability

This sprint is data-focused. Do not redesign the entire dashboard UI.

--------------------------------------------------
PHASE 0 — SAFETY AND BASELINE
--------------------------------------------------

Before changing anything:

1. Confirm repository path.
2. Confirm current branch and HEAD.
3. Run:
   - git status --short
   - git log -8 --oneline
4. Record existing untracked files.
5. Do not delete or overwrite unrelated user files.
6. Inspect package.json and existing data scripts.
7. Inspect current dashboard-data directories and generated JSON.
8. Identify the existing canonical pipeline before creating new files.

Stop with BLOCKED if:
- Repository is missing.
- Branch contains unresolved conflicts.
- Working tree contains unexplained code changes that risk being overwritten.
- Required source spreadsheets cannot be located.

Untracked report/output files may remain untouched if they are unrelated.

--------------------------------------------------
PHASE 1 — TARGETED REPOSITORY AUDIT
--------------------------------------------------

Audit only relevant areas:

- package.json scripts
- src/data/**
- src/content/**
- src/components/dashboard/**
- src/pages/**/dashboard/**
- scripts/**
- public/data/**
- docs/data/**
- tests or validation scripts
- existing dashboard schema/types
- existing generated JSON
- current bilingual metric configuration

Produce a concise internal reuse map:

- existing source-data locations
- parsers/importers
- normalization functions
- validators
- generated outputs
- dashboard consumers
- duplicated or hardcoded values
- missing source traceability
- schema inconsistencies

Reuse the current pipeline where viable.
Do not restructure the repository merely to match a reference diagram.

--------------------------------------------------
PHASE 2 — SOURCE WORKBOOK INSPECTION
--------------------------------------------------

Assign each independent workbook to a worker for read-only inspection:

Worker A:
- Water
- Electricity

Worker B:
- Fuel
- Paper

Worker C:
- Waste

Worker D:
- Greenhouse Gas

Each worker reports only:

1. workbook path
2. sheet names
3. header rows
4. year columns
5. month representation
6. units
7. formulas versus literal values
8. annual-total location
9. missing or malformed cells
10. normalization risks
11. recommended source mapping

Do not modify source XLSX files.

Head Agent must reconcile findings before implementation.

Special checks:
- Thai Buddhist year versus Gregorian year
- Thai month names and English month names
- numeric cells stored as strings
- commas, spaces, dash placeholders, and merged cells
- formulas with cached values
- inconsistent units
- duplicate total rows
- blank months
- monthly values that do not reconcile with annual totals
- negative values
- hidden sheets or hidden rows relevant to totals

--------------------------------------------------
PHASE 3 — CANONICAL DATA CONTRACT
--------------------------------------------------

Define or consolidate a canonical schema for environmental metrics.

Prefer a shared TypeScript type/schema similar to:

{
  id: string,
  metric: "water" | "electricity" | "fuel" | "paper" | "waste" | "ghg",
  yearBE: number,
  yearCE: number,
  unit: string,
  source: {
    file: string,
    sheet: string,
    importedAt: string,
    sourceType: "xlsx"
  },
  monthly: [
    {
      month: 1-12,
      value: number | null
    }
  ],
  annualTotal: number | null,
  target: number | null,
  baselineYearBE: number | null,
  previousYearBE: number | null,
  status: "on-track" | "off-track" | "no-target" | "insufficient-data",
  quality: {
    valid: boolean,
    warnings: string[],
    reconciliationDifference: number | null
  },
  relatedIndicators: string[],
  sourceEvidence: string[]
}

The exact implementation may adapt to existing repository conventions.

Requirements:
- One canonical source per metric/year.
- No duplicated manually maintained totals.
- Annual total should be derived from monthly values where possible.
- Preserve the workbook total separately only when needed for reconciliation.
- Use explicit year and unit labels.
- No fabricated target values.
- Unknown target must be null with status "no-target".
- Unknown evidence links must remain empty arrays, not invented IDs.
- Avoid timestamps that create meaningless file diffs on every build.
  Use deterministic output unless import execution time is intentionally tracked
  outside generated JSON.

Waste may require multiple series:
- general waste
- recycled/reused waste
- other relevant types found in the workbook

GHG may require multiple dimensions:
- Scope/category 1, 2, and 3
- activity source
- monthly total
- annual total
- emission factor reference/version where available

Do not flatten meaningful source dimensions just to simplify the chart.

--------------------------------------------------
PHASE 4 — NORMALIZATION AND VALIDATION
--------------------------------------------------

Implement or improve a deterministic script pipeline.

Preferred commands, adapted to the existing project:

npm run data:import
npm run data:validate
npm run data:generate
npm run data:check

A combined command may also be provided:

npm run data:build

The pipeline must:

1. Read source XLSX files.
2. Normalize month/year/unit labels.
3. Convert valid numeric strings safely.
4. Preserve null for truly missing data.
5. Reject invalid numeric content.
6. Calculate annual totals.
7. Compare calculated totals with workbook totals when present.
8. Emit warnings for reconciliation differences.
9. Validate schema.
10. Generate deterministic JSON.
11. Produce a concise human-readable validation report.

Do not silently coerce:
- blanks to zero
- dash placeholders to zero
- malformed strings to zero
- percentages to plain values without explicit conversion

Validation failures must exit non-zero for critical errors.

Critical errors include:
- duplicate metric/year identity
- invalid month number
- missing required unit
- non-finite number
- negative consumption where unsupported
- annual total materially inconsistent without an accepted explanation
- missing required source workbook
- schema-invalid output

Warnings may include:
- missing target
- missing evidence mapping
- missing month
- workbook-calculated total differs only due to defined rounding tolerance

Define and document reconciliation tolerance.

--------------------------------------------------
PHASE 5 — GENERATED OUTPUTS
--------------------------------------------------

Generate canonical runtime outputs in the existing preferred data directory.

Avoid creating parallel competing structures.

Expected logical outputs:

- water data
- electricity data
- fuel data
- paper data
- waste data
- greenhouse-gas data
- executive KPI summary
- data-quality summary

The executive KPI summary must be generated from canonical metric data,
not maintained manually.

Include:
- current/display year
- metric value
- unit
- target where available
- baseline/previous-year comparison where available
- status
- data-quality state
- source file reference

Do not include raw local absolute paths in public browser-facing JSON.
Use safe repository-relative source references.

--------------------------------------------------
PHASE 6 — ASTRO INTEGRATION
--------------------------------------------------

Update dashboard consumers only as required to use canonical outputs.

Requirements:
- Existing routes must continue working.
- Thai and English routes must use the same numeric source.
- Labels may differ by locale; values must not.
- No duplicated metric totals inside Astro components.
- Existing resource icons and recent dashboard UX improvements must be preserved.
- Charts must gracefully handle null months.
- KPI cards must display units consistently.
- Missing targets must display an honest "ยังไม่มีเป้าหมาย / Target not set"
  state rather than suggesting success.
- Add accessible text summaries for chart data if missing.

Do not:
- redesign the full dashboard
- add a database
- add an API
- add authentication
- add a CMS
- add new chart libraries without strong necessity
- replace working components only for stylistic preference

--------------------------------------------------
PHASE 7 — CRITERIA AND TRACEABILITY MAPPING
--------------------------------------------------

Map metrics to the official Green Office 2569 indicators:

- Water → 3.1.2
- Electricity → 3.2.2
- Fuel → 3.2.5
- Paper → 3.3.2
- Waste → relevant 4.1 indicators based on actual dataset semantics
- GHG → 1.5.1 and 1.5.2

Also consider the seven target domains required by indicator 1.1.3:
- electricity
- fuel
- water
- paper
- recycled/reused waste
- general waste
- greenhouse gas

Do not claim compliance or readiness based on data alone.
The system may state that data supports an indicator, but must not assign an
official audit score.

The official criteria require all seven environmental targets and indicators,
and GHG analysis must support monthly comparison, type/scope comparison,
activity comparison, and baseline comparison where applicable.

--------------------------------------------------
PHASE 8 — TESTING AND QUALITY GATES
--------------------------------------------------

Run all applicable checks:

1. Data import
2. Schema validation
3. Reconciliation check
4. Type checking
5. Astro build
6. Existing test suite
7. Route generation verification
8. Broken internal-link check if available
9. Thai dashboard smoke test
10. English dashboard smoke test
11. Homepage KPI smoke test
12. Verify no raw local paths leak into public output
13. Verify generated files are deterministic:
    run generation twice and confirm no second-run diff

Required:
- npm build command PASS
- no unexplained console/runtime errors
- no broken dashboard route
- no mismatch between TH and EN numeric values
- no hardcoded annual KPI values remaining in relevant components
- generated annual totals reconcile with source or produce explicit warnings

For runtime verification, check at minimum:

/
 /en/
 /dashboard/
 /dashboard/water/
 /dashboard/electricity/
 /dashboard/fuel/
 /dashboard/paper/
 /dashboard/waste/
 /dashboard/ghg/

Also verify corresponding existing English routes based on actual routing.

--------------------------------------------------
PHASE 9 — DOCUMENTATION
--------------------------------------------------

Create:

docs/data/GO-DATA-1-DATA-CONTRACT.md
docs/data/GO-DATA-1-SOURCE-MAP.md
docs/data/GO-DATA-1-VALIDATION-REPORT.md
docs/releases/GOFFICE2026_GO-DATA-1_REPORT.md

Documentation must be concise and include:

- source workbook mapping
- canonical schema
- normalization rules
- validation rules
- target handling
- reconciliation tolerance
- generated output paths
- npm commands
- known limitations
- future update procedure
- exact values derived for each metric/year
- warnings and unresolved data issues
- criteria/indicator mappings

Do not paste full workbook contents into documentation.

--------------------------------------------------
PHASE 10 — GIT AND RELEASE
--------------------------------------------------

After all quality gates pass:

1. Review git diff.
2. Confirm no unrelated files are included.
3. Commit with a clear message, preferably:

feat(data): consolidate environmental data pipeline

4. Push to origin/master.
5. Confirm local HEAD equals origin/master.
6. Confirm working tree is clean except documented pre-existing untracked files.
7. Verify GitHub Pages workflow was triggered.
8. Do not deploy to Linux production.
9. Do not manually edit production.

If tests fail:
- fix within sprint scope
- do not commit knowingly broken code
- report BLOCKED if source data ambiguity cannot be resolved safely

--------------------------------------------------
FINAL REPORT FORMAT
--------------------------------------------------

Return one bounded final report:

# GO-DATA-1 Final Report

## 1. Verdict
SUCCESS / PARTIAL / BLOCKED

## 2. Repository State
- path
- branch
- starting HEAD
- final HEAD
- origin/master HEAD
- ahead/behind
- working tree

## 3. Source Files
Table:
metric | workbook | sheet | year | unit | source status

## 4. Derived Results
Table:
metric | annual total | unit | monthly completeness | reconciliation | quality

Include separate Waste and GHG dimensions where relevant.

## 5. Pipeline
- scripts added/reused
- commands
- canonical outputs
- deterministic generation result

## 6. Integration
- pages/components updated
- TH/EN parity
- homepage KPI integration
- indicator mappings

## 7. Quality Gates
Table:
check | result | notes

## 8. Files Changed
Group by:
- scripts
- schemas/types
- generated data
- Astro integration
- tests
- documentation

## 9. Git
- commit hash
- commit message
- push result
- GitHub Pages workflow status

## 10. Remaining Risks
Maximum 8 concise items.

## 11. Recommended Next Sprint
Recommend exactly one next sprint based on actual findings.

Do not provide long narration or raw command logs.