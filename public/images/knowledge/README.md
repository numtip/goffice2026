# Knowledge Practice Visuals — Asset Destination

Drop-in location for the 8-practice Magnific-generated visual assets of the
`/knowledge/` hub and practice pages.

Naming contract (WebP only, local assets — never hotlink remote Magnific URLs):

| Slot         | Pattern                  | Aspect | Source size   | Used on                                            |
|--------------|--------------------------|--------|---------------|----------------------------------------------------|
| Hero         | `{slug}-hero.webp`       | 16:9   | 1920×1080     | Practice page hero banner + practice card thumbnail |
| Campaign     | `{slug}-campaign.webp`   | 4:5    | 1080×1350     | Campaign / feature slot                            |
| Social / Reel| `{slug}-social.webp`     | 9:16   | 1080×1920     | Social media / short-form reel                     |
| Infographic  | `{slug}-infographic.webp`| 1:1    | 1200×1200     | Optional — only where later supplied               |

`{slug}` is the practice slug: `green-office-mindset`, `energy-smart`,
`water-wise`, `paper-smart`, `zero-waste`, `green-mobility`, `green-meeting`,
`green-workplace`.

## Supply workflow (no code change required)

1. Generate the artwork in Magnific.
2. Optimize to WebP and drop it here with the exact filename above.
3. Build and preview — `src/data/knowledge/practiceAssets.ts` auto-detects the
   file and `PracticeImage.astro` renders it with the documented alt text
   (TH/EN) and lazy loading. Until the file exists, the accent/icon fallback
   renders and no broken image state occurs.
4. Update the alt-text intents if the final artwork needs more precise
   descriptions: `src/data/knowledge/practiceAssets.ts`.

Full contract: `docs/design/KNOWLEDGE_MEDIA_ASSET_MANIFEST.md`.

## Status

All slots **PENDING_MAGNIFIC** — no files present yet.
