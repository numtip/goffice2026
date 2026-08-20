# Landing Hero Cinematic Media (H1.5)

Reproduce production derivatives from the MASTER clip. Never serve or modify the master.

## Master

| Field | Value |
|---|---|
| Path | `data/clips/greenbuit1.mp4` |
| Role | MASTER only — not copied into `public/` |
| Typical | ~24.2s · 2560×1440 · H.264 · ~40.7 MB · ~14 Mbps · AAC present |

## Public derivatives

| File | Role |
|---|---|
| `public/media/hero/green-office-building-hero-cinematic.mp4` | Desktop/tablet progressive-enhancement loop |
| `public/media/hero/green-office-building-hero-1920.webp` | Poster / LCP / no-JS / mobile / reduced-motion |
| `public/media/hero/green-office-building-hero-1280.webp` | `srcset` 1280w |
| `public/media/hero/green-office-building-hero-768.webp` | `srcset` 768w |

URLs are resolved through `src/utils/wow2-images.ts` (`landingHeroPosterUrl`, `heroCinematicVideoUrl`) so GitHub Pages `BASE_URL` stays correct. Do not hardcode `/media/...`.

## Encode

Requires `ffmpeg` and `ffprobe` on PATH.

```powershell
node scripts/encode-hero-cinematic.mjs
```

Equivalent commands (Windows `NUL`; use `/dev/null` on Unix):

```bash
ffmpeg -y -i data/clips/greenbuit1.mp4 -an \
  -vf "scale=1920:1080:flags=lanczos" \
  -c:v libx264 -pix_fmt yuv420p -profile:v high -level 4.1 \
  -preset slow -b:v 2200k -maxrate 2400k -bufsize 4400k \
  -pass 1 -passlogfile public/media/hero/ffmpeg2pass \
  -f mp4 NUL

ffmpeg -y -i data/clips/greenbuit1.mp4 -an \
  -vf "scale=1920:1080:flags=lanczos" \
  -c:v libx264 -pix_fmt yuv420p -profile:v high -level 4.1 \
  -preset slow -b:v 2200k -maxrate 2400k -bufsize 4400k \
  -movflags +faststart \
  -pass 2 -passlogfile public/media/hero/ffmpeg2pass \
  public/media/hero/green-office-building-hero-cinematic.mp4
```

Poster stills (opening frame, matches video start):

```bash
ffmpeg -y -ss 0.5 -i data/clips/greenbuit1.mp4 -frames:v 1 -update 1 \
  -vf "scale=1920:1080:flags=lanczos" -c:v libwebp -quality 80 \
  public/media/hero/green-office-building-hero-1920.webp
```

Repeat `scale=1280:720` and `scale=768:432` for the smaller posters.

## Budget

- Target desktop MP4: **≤6–8 MB**
- Hard cap: **10 MB** (script exits 2 above this)
- No audio
- No WebM unless a future encode proves a material size win

## Runtime contract

- Poster `<picture>` / `<img>` is always in HTML (`eager` + `fetchpriority="high"`).
- Video `src` is assigned only when JS confirms desktop/tablet, motion is allowed, and Save-Data is off.
- `prefers-reduced-motion: reduce` and viewports `<768px` never autoplay and should not request the MP4.
- WOW2 `heroImageUrl` (`Executive Dashboard Hero.webp`) remains the dashboard/command still. It is not the Landing Hero poster.
