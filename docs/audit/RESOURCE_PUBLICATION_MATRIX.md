# RESOURCE_PUBLICATION_MATRIX

Updated: 2026-09-10  
Authority: OneDrive `07-GreenOffice/Resource` (logical path only — never expose absolute Windows drive paths in public metadata)  
Distribution: `data/staging/source/` → `public/documents/resources/` (byte-identical copies)

| metric | year | authoritative file | SHA256 | public path | evidence ID | indicator | HTTP/result |
|--------|------|---------------------|--------|-------------|-------------|-----------|-------------|
| water | 2568, 2569 | 1.1Water.xlsx | `554beacdea923bb7bdb9bea5bea484c6881b8f32a50289ad927f1ce2d5fdde6f` | `/documents/resources/water/1.1Water.xlsx` | ev-resource-xlsx-water | 3.1.2 | MATCH — public-static |
| electricity | 2568, 2569 | 1.2electric.xlsx | `097d0cfc031045e2db0ff989ffc72aed4dd4a073537f9453e0170229a9c4a8da` | `/documents/resources/electricity/1.2electric.xlsx` | ev-resource-xlsx-electricity | 3.2.2 | MATCH — public-static |
| fuel | 2568, 2569 | 1.3Gassolene.xlsx | `0e610a4b22ecfdc781d9c14d8b4e4c10ec8189ff019206b631507bb93e121566` | `/documents/resources/fuel/1.3Gassolene.xlsx` | ev-resource-xlsx-fuel | 3.2.5 | MATCH — public-static |
| paper | 2568, 2569 | 1.4paper.xlsx | `4cb0c068408a71f30263917ddbbdb9dee2d5f1c231713904857dd4d0513af823` | `/documents/resources/paper/1.4paper.xlsx` | ev-resource-xlsx-paper | 3.3.2 | MATCH — resynced 2026-09-10 |
| waste | 2568 | 1.5waste2025.xlsx | `5512418f9fa10a8baaf5c71601e8d5d47396254725babfae3a64fd413be23e5c` | `/documents/resources/waste/1.5waste2025.xlsx` | ev-resource-xlsx-waste-fy2568 | 4.1.3 | MATCH — public-static |
| waste | 2569 | 1.5waste2026.xlsx | `ca94a2b602375dd8c7cc4d5185184e45eb137a1830f6d78efa502235e1a8142f` | `/documents/resources/waste/1.5waste2026.xlsx` | ev-resource-xlsx-waste-fy2569 | 4.1.3 | MATCH — resynced 2026-09-10 |
| ghg | 2568 | 1.6GreenHouseGas2025.xlsx | `ffbbdcb2be28990eeb4c5cdc69528bae33a23f7300d7d4ebbb82fdfc677b9ad5` | `/documents/resources/ghg/1.6GreenHouseGas2025.xlsx` | ev-ghg-inventory-2025, ev-ghg-emission-factors | 1.5.1 | MATCH — authority moved from Data2568 update2 |
| ghg | 2569 | 1.6GreenHouseGas2026_New.xlsx | `d0a75e4cf05319112d10b4d877174782041214678f14ab6875c293769e4a352d` | `/documents/resources/ghg/1.6GreenHouseGas2026_New.xlsx` | ev-resource-xlsx-ghg-fy2569 | 1.5.1 | MATCH — public-static |

## Superseded / stale (not rendered)

| former path | reason |
|-------------|--------|
| `/documents/fy2568/cat1/1.5Green house gass/1.5_greenhousegass_update2.xlsx` | Interim Data2568 copy; superseded by Resource `1.6GreenHouseGas2025.xlsx` |
| `/documents/cat1/ghg-inventory-2025.xlsx` | Legacy alias |

## Pipeline (unchanged)

```
OneDrive Resource (authoritative)
  → staging copy → normalize/validate → generated JSON → dashboard
  → public distribution copy → evidence/dashboard download link
```
