# Dashboard API Contract v1

**Version:** `v1`  
**Updated:** 2026-07-26  
**Consumers:** `src/lib/repositories/dashboard-repository.ts`, Astro dashboard pages

This contract defines how the public dashboard obtains monthly environmental metrics from Supabase (live) or static JSON (fallback). It aligns with public views in migration `202607260004` and static files in `src/data/generated/`.

---

## Design Principles

1. **Approved data only** in live responses — same rule as public views.
2. **Static fallback always available** — missing Supabase config must not break build or runtime.
3. **No PII** — no email, user IDs, staff notes, or review comments in responses.
4. **Explicit source** — every envelope declares `source` and `fallback`.
5. **Baseline merge** — 2568 baseline may remain static JSON; 2569+ live approved data merges at repository layer (`hybrid` mode).

---

## Data Modes

Controlled by `PUBLIC_DASHBOARD_DATA_MODE`:

| Mode | Behavior |
|------|----------|
| `static` (default) | Load `src/data/generated/*.json` only |
| `live` | Query Supabase public views; fallback on error |
| `hybrid` | Static baseline years + live current-year approved rows |

---

## Response Envelope (Live)

All successful live responses use this top-level shape:

```json
{
  "contractVersion": "v1",
  "source": "supabase",
  "generatedAt": "2026-07-26T04:00:00.000Z",
  "dataUpdatedAt": "2026-07-25T09:30:00.000Z",
  "fallback": false,
  "metrics": []
}
```

| Field | Type | Description |
|-------|------|-------------|
| `contractVersion` | `"v1"` | Contract version for breaking-change detection |
| `source` | `"supabase"` | Data origin |
| `generatedAt` | ISO 8601 UTC | When this response was assembled |
| `dataUpdatedAt` | ISO 8601 UTC | Latest `updated_at` or `approved_at` among included rows |
| `fallback` | `false` | Live data successfully retrieved |
| `metrics` | array | Payload; shape depends on endpoint (below) |

---

## Response Envelope (Static Fallback)

When Supabase is unavailable, misconfigured, or mode is `static`:

```json
{
  "contractVersion": "v1",
  "source": "static-json",
  "generatedAt": "2026-07-26T04:00:00.000Z",
  "dataUpdatedAt": "2026-07-15",
  "fallback": true,
  "metrics": []
}
```

| Field | Type | Description |
|-------|------|-------------|
| `source` | `"static-json"` | Loaded from `src/data/generated/` |
| `fallback` | `true` | UI should show fallback indicator |
| `dataUpdatedAt` | ISO date or datetime | From generated file metadata |

Optional fallback fields:

```json
{
  "fallbackReason": "supabase_unavailable",
  "fallbackMessage": "Showing last generated snapshot."
}
```

| `fallbackReason` | Meaning |
|------------------|---------|
| `supabase_unavailable` | Network or service error |
| `supabase_unconfigured` | Missing URL or anon key |
| `mode_static` | Deliberate static mode |
| `rls_or_empty` | Query succeeded but no approved rows |

---

## 1. Monthly Dashboard Metrics

**Source view:** `public_dashboard_monthly_metrics`  
**Static file per metric:** `src/data/generated/{energy,water,fuel,paper,waste,ghg}.json`

### Metric item shape (live)

```json
{
  "metricCode": "energy",
  "metricLabelTh": "การใช้ไฟฟ้า",
  "metricLabelEn": "Electricity Consumption",
  "unit": "kWh",
  "departmentCode": "OFFICE",
  "departmentNameTh": "สำนักงานกลาง",
  "year": 2569,
  "month": 1,
  "value": 12450.5,
  "approvedAt": "2026-07-20T08:00:00.000Z",
  "updatedAt": "2026-07-20T08:00:00.000Z"
}
```

### Example live envelope

```json
{
  "contractVersion": "v1",
  "source": "supabase",
  "generatedAt": "2026-07-26T04:00:00.000Z",
  "dataUpdatedAt": "2026-07-25T14:22:00.000Z",
  "fallback": false,
  "metrics": [
    {
      "metricCode": "energy",
      "metricLabelTh": "การใช้ไฟฟ้า",
      "metricLabelEn": "Electricity Consumption",
      "unit": "kWh",
      "departmentCode": "OFFICE",
      "departmentNameTh": "สำนักงานกลาง",
      "year": 2569,
      "month": 1,
      "value": 12450.5,
      "approvedAt": "2026-07-20T08:00:00.000Z",
      "updatedAt": "2026-07-20T08:00:00.000Z"
    },
    {
      "metricCode": "water",
      "metricLabelTh": "การใช้น้ำ",
      "metricLabelEn": "Water Consumption",
      "unit": "m³",
      "departmentCode": "OFFICE",
      "departmentNameTh": "สำนักงานกลาง",
      "year": 2569,
      "month": 1,
      "value": 820.0,
      "approvedAt": "2026-07-21T10:15:00.000Z",
      "updatedAt": "2026-07-21T10:15:00.000Z"
    }
  ]
}
```

### Static fallback example (abbreviated)

Uses existing generated schema; envelope still wraps array:

```json
{
  "contractVersion": "v1",
  "source": "static-json",
  "generatedAt": "2026-07-26T04:00:00.000Z",
  "dataUpdatedAt": "2026-07-15",
  "fallback": true,
  "fallbackReason": "mode_static",
  "metrics": [
    {
      "metric": "energy",
      "label": "Electricity Consumption",
      "labelTh": "การใช้ไฟฟ้า",
      "unit": "kWh",
      "baselineYear": 2568,
      "currentYear": 2569,
      "years": { "2568": { "months": [], "total": 403036.8 } }
    }
  ]
}
```

Repository layer normalizes static files into `PublicDashboardMetric[]` where needed.

---

## 2. Executive Summary

**Source view:** `public_dashboard_executive_summary`  
**Static file:** `src/data/generated/kpi-summary.json`

### Summary item shape (live)

```json
{
  "metricCode": "energy",
  "year": 2569,
  "totalValue": 149100,
  "monthCount": 8,
  "lastApprovedAt": "2026-07-25T14:22:00.000Z"
}
```

### Example live envelope

```json
{
  "contractVersion": "v1",
  "source": "supabase",
  "generatedAt": "2026-07-26T04:00:00.000Z",
  "dataUpdatedAt": "2026-07-25T14:22:00.000Z",
  "fallback": false,
  "metrics": [
    {
      "metricCode": "energy",
      "year": 2569,
      "totalValue": 149100,
      "monthCount": 8,
      "lastApprovedAt": "2026-07-25T14:22:00.000Z"
    },
    {
      "metricCode": "ghg",
      "year": 2569,
      "totalValue": 42.6,
      "monthCount": 3,
      "lastApprovedAt": "2026-07-24T11:00:00.000Z"
    }
  ]
}
```

**Note:** `waste` (% unit) uses **average** aggregation across months, not sum (GO-DATA-1A). Executive summary derivation must respect per-metric aggregation rules from `metric_types.config_metadata`.

---

## 3. Last-Updated Metadata

**Source view:** `public_dashboard_metadata`  
**Purpose:** Dashboard banner, freshness indicator, cache validation

### Metadata shape

```json
{
  "lastUpdatedAt": "2026-07-25T14:22:00.000Z",
  "lastApprovedAt": "2026-07-25T14:22:00.000Z",
  "reportingYear": 2569,
  "approvedEntryCount": 48,
  "metricTypeCount": 6,
  "sourceLabel": "supabase"
}
```

### Example envelope

```json
{
  "contractVersion": "v1",
  "source": "supabase",
  "generatedAt": "2026-07-26T04:00:00.000Z",
  "dataUpdatedAt": "2026-07-25T14:22:00.000Z",
  "fallback": false,
  "metrics": [],
  "metadata": {
    "lastUpdatedAt": "2026-07-25T14:22:00.000Z",
    "lastApprovedAt": "2026-07-25T14:22:00.000Z",
    "reportingYear": 2569,
    "approvedEntryCount": 48,
    "metricTypeCount": 6,
    "sourceLabel": "supabase"
  }
}
```

For static fallback, `metadata.sourceLabel` is `"static-json"` and dates come from file `updated` fields.

---

## 4. Completeness Metadata

**Source:** `public_dashboard_metadata` + optional `organization_settings`  
**Purpose:** Indicate coverage gaps without exposing draft/submitted rows

### Completeness shape

```json
{
  "reportingYear": 2569,
  "expectedMonths": 12,
  "metrics": [
    {
      "metricCode": "energy",
      "approvedMonthCount": 8,
      "missingMonths": [9, 10, 11, 12],
      "completenessPct": 66.7,
      "status": "partial"
    },
    {
      "metricCode": "fuel",
      "approvedMonthCount": 0,
      "missingMonths": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      "completenessPct": 0,
      "status": "missing"
    }
  ],
  "overallCompletenessPct": 45.8
}
```

| `status` | Condition |
|----------|-----------|
| `complete` | `approvedMonthCount === expectedMonths` |
| `partial` | Some approved months |
| `missing` | No approved months |

### Example envelope

```json
{
  "contractVersion": "v1",
  "source": "supabase",
  "generatedAt": "2026-07-26T04:00:00.000Z",
  "dataUpdatedAt": "2026-07-25T14:22:00.000Z",
  "fallback": false,
  "metrics": [],
  "completeness": {
    "reportingYear": 2569,
    "expectedMonths": 12,
    "metrics": [
      {
        "metricCode": "energy",
        "approvedMonthCount": 8,
        "missingMonths": [9, 10, 11, 12],
        "completenessPct": 66.7,
        "status": "partial"
      }
    ],
    "overallCompletenessPct": 66.7
  }
}
```

Static fallback may include completeness derived from `data-quality.json` warnings.

---

## 5. Unavailable / Live Error State

When `live` or `hybrid` mode attempts Supabase and fails, return a structured error **then** fall back to static JSON.

### Error object (pre-fallback)

```json
{
  "contractVersion": "v1",
  "source": "supabase",
  "generatedAt": "2026-07-26T04:00:00.000Z",
  "fallback": false,
  "error": {
    "code": "SUPABASE_UNAVAILABLE",
    "message": "Unable to reach approved metrics service.",
    "retryable": true
  }
}
```

| Error code | Meaning |
|------------|---------|
| `SUPABASE_UNAVAILABLE` | Network/timeout/5xx |
| `SUPABASE_UNCONFIGURED` | Missing env vars |
| `SUPABASE_QUERY_FAILED` | RLS or query error |
| `SUPABASE_EMPTY` | No approved rows for requested period |

### Client behavior

1. Log error internally (no secrets).
2. Load static JSON fallback envelope with `fallback: true`.
3. Surface UI banner: *Showing last saved snapshot — live data temporarily unavailable.*

Example post-fallback envelope:

```json
{
  "contractVersion": "v1",
  "source": "static-json",
  "generatedAt": "2026-07-26T04:00:01.000Z",
  "dataUpdatedAt": "2026-07-15",
  "fallback": true,
  "fallbackReason": "supabase_unavailable",
  "fallbackMessage": "Showing last generated snapshot.",
  "metrics": []
}
```

---

## 6. Static Fallback State (Explicit)

Default production/preview behavior until PO activates live mode.

```json
{
  "contractVersion": "v1",
  "source": "static-json",
  "generatedAt": "2026-07-26T04:00:00.000Z",
  "dataUpdatedAt": "2026-07-15",
  "fallback": true,
  "fallbackReason": "mode_static",
  "metrics": []
}
```

**Guarantees:**

- `npm run build` succeeds with zero Supabase env vars.
- Dashboard renders from `src/data/generated/`.
- No anon key required in CI/GitHub Pages.

---

## Query Mapping (Live)

| Contract endpoint | Supabase source |
|-------------------|-----------------|
| Monthly metrics | `SELECT * FROM public_dashboard_monthly_metrics WHERE year = $1` |
| Executive summary | `SELECT * FROM public_dashboard_executive_summary WHERE year = $1` |
| Metadata | `SELECT * FROM public_dashboard_metadata` |
| Completeness | Derived from metadata view + metric dimension |

All queries use anon key; RLS on views restricts to approved projections.

---

## Field Exclusions (Privacy)

Never include in v1 responses:

- `email`, `full_name`, profile IDs
- `note` on entries
- `review_comments`
- `audit_logs`
- Draft or submitted values
- Service-role tokens or internal Supabase project IDs

---

## Versioning

Breaking changes require `contractVersion: "v2"`. Additive fields may be added to `v1` without version bump if consumers ignore unknown keys.

---

## Related Documents

- [Schema Reference](./SUPABASE_SCHEMA.md)
- [RLS Policy Reference](./RLS_POLICY.md)
- [GO-DATA-1 Data Contract](../data/GO-DATA-1-DATA-CONTRACT.md)
- [ADR-004 Live Dashboard with Static Fallback](../architecture/adr/ADR-004-LIVE-DASHBOARD-WITH-STATIC-FALLBACK.md)
