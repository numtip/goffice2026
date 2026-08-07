# Adapter Boundary Specification (PROPOSAL)

**Status:** PROPOSAL — no implementation
**Date:** 2026-08-02
**Canonical flow:**
```
DC Record (627) → DC public export (PXP-1) → [GO-side adapter] → GO public manifest → GO evidence navigator → indicator/dashboard page
```

---

## 1. Boundary Principle

- **DC is frozen (READ-MOSTLY).** Nothing is added or changed in DC.
- All integration work happens **GO-side** (`/home/rae_admin/goffice2026`), as new
  additive files + adapter scripts that consume **export artifacts**, never live SharePoint.
- GO remains a static Astro site — the adapter is a **build-time** step, not runtime.

---

## 2. Layer Diagram

| Layer | Location | Responsibility |
|---|---|---|
| L0 Source | DC SharePoint (627) | authoritative files |
| L1 Export | DC repo (frozen) | `document-registry.public.json` + `.sha256` (already exists) |
| L2 Adapter (NEW) | GO `scripts/` | reads L1 → validates → produces L3 |
| L3 Manifest (NEW) | GO `src/data/dc-public-manifest.json` | public metadata contract (v0.1) |
| L4 Presentation | GO pages | evidence navigator / dashboard consume L3 for metadata only |

---

## 3. Adapter Responsibilities (spec only)

1. **Input:** `document-registry.public.json` + `.sha256` (verify checksum first).
2. **Filter:** drop records where `Visibility != public` or `DownloadMode == AUTHENTICATED_SHAREPOINT` (→ `excludeFromPublic`).
3. **Transform:** DC fields → manifest fields per contract (no id invention; category kept raw).
4. **Validate:** mirror `validate-public-export.py` rules (enum, order, required fields, per-record errors).
5. **Output:** `dc-public-manifest.json` + `.sha256` + validation report.
6. **Exit:** non-zero on any hard error; never emit partial manifest.

**Non-goals:** no file download, no auth, no SharePoint API, no GO data mutation.

---

## 4. Data-Flow Validation Points

| Point | Check |
|---|---|
| L1→L2 | checksum of DC export matches published `.sha256` |
| L2→L3 | 100% of public records represented; excluded count documented |
| L3→L4 | every manifest `documentId` unique; no `StorageURL` in output |

---

## 5. TH/EN, Provenance, SHA Policy

- **TH/EN:** manifest carries TH title (from DC); GO page layer adds EN via existing
  locale files — no EN invented at adapter.
- **Provenance:** each record links `source: "RAE Document Registry export <sha>"` —
  traceable to the exact export artifact.
- **SHA256 (per-file):** NOT set by adapter (files not on disk yet). Set only after
  restore + `sha256sum` verification (Evidence Gate scope). Manifest `sha256: null`
  until then.

---

## 6. Rollback / Compatibility

- Adapter is a new script; no existing behavior changes.
- If manifest missing/stale → GO builds without DC (current behavior). **No coupling.**
- Removing adapter + manifest restores today's state exactly.

**Verdict: PLANNING_READY**
