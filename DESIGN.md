---
name: GOFFICE2026
description: Bilingual evidence-first Green Office platform for Maejo University.
colors:
  primary: "#003527"
  primary-container: "#064e3b"
  secondary: "#006c49"
  secondary-fixed: "#6ffbbe"
  surface: "#f8f9ff"
  surface-container: "#e5eeff"
  surface-container-lowest: "#ffffff"
  on-surface: "#0b1c30"
  on-surface-variant: "#404944"
  inverse-surface: "#213145"
  outline: "#707974"
  outline-variant: "#bfc9c3"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "64px"
    fontWeight: 700
    lineHeight: "72px"
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 600
    lineHeight: "48px"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
rounded:
  stitch: "0.75rem"
  stitch-lg: "2rem"
spacing:
  section-gap: "80px"
  margin-desktop: "64px"
  margin-mobile: "20px"
  gutter: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface-container-lowest}"
    rounded: "{rounded.stitch-lg}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.stitch-lg}"
    padding: "12px 24px"
---

# Design System: GOFFICE2026

## 1. Overview

**Creative North Star: "Evidence Control Room"**

The system serves a public institutional website and an operational preview tool at the same time. It should feel calm, accountable, and easy to scan, with landing pages that explain the story and dashboard pages that get out of the user's way.

**Key Characteristics:**
- Static-first, bilingual, and evidence-led.
- Restrained green identity with cool surface layers.
- Dense enough for auditors and executives, plain enough for first-time public visitors.
- Minimal client-side motion, always safe under reduced motion and no-JavaScript conditions.

## 2. Colors

The palette uses deep institutional green, bright verification green, cool blue-white surfaces, and dark ink for evidence-heavy content.

### Primary
- **Institution Green**: Main brand, active navigation, primary buttons, and high-confidence links.
- **Deep Evidence Green**: Dark containers and high-emphasis panels.

### Secondary
- **Verification Green**: Success, confirmed evidence, and progress indicators.

### Neutral
- **Cool Surface**: Page backgrounds and calm data surfaces.
- **White Surface**: Cards, navigation, and document panels.
- **Audit Ink**: Primary text.
- **Muted Ink**: Secondary explanatory text.

### Named Rules

**The Evidence Color Rule.** Green communicates identity, active state, progress, and verified evidence; it must not become generic decoration.

## 3. Typography

**Display Font:** Inter, system-ui, sans-serif  
**Body Font:** Inter, system-ui, sans-serif  
**Label/Mono Font:** ui-monospace only for compact data labels and file-like metadata.

**Character:** Functional, institutional, and compact. The system should favor clarity over expressive type pairing.

### Hierarchy
- **Display**: Landing hero only; keep long bilingual strings within mobile-safe widths.
- **Headline**: Section and page headings.
- **Title**: Cards, dashboard panels, and evidence modules.
- **Body**: Explanatory copy; cap long prose around 65-75ch.
- **Label**: Short metadata labels; avoid wide tracking for repeated section grammar.

### Named Rules

**The Bilingual Fit Rule.** Thai and English labels must wrap gracefully before any visual flourish is allowed.

## 4. Elevation

Depth is mostly tonal layering plus restrained shadows. Shadows may clarify floating navigation, dropdowns, and actionable cards, but routine content panels should stay quiet.

### Shadow Vocabulary
- **Navigation shadow**: subtle sticky-header separation.
- **Card shadow**: low elevation for grouped dashboard and evidence content.
- **Hero glass shadow**: legacy landing treatment; audit before expanding.

## 5. Components

### Buttons
- **Shape:** Pill for landing CTAs; small rounded rectangles for app navigation.
- **Primary:** Deep green background with white text.
- **Hover / Focus:** Small lift is allowed, but focus rings must remain visible and reduced motion must disable transforms.
- **Secondary / Ghost:** Border or transparent treatment with clear text contrast.

### Chips
- **Style:** Status chips use semantic color families and must include text, not color alone.

### Cards / Containers
- **Corner Style:** 12px for product cards; 32px only on expressive landing surfaces.
- **Background:** White or cool surface containers.
- **Shadow Strategy:** Low shadow by default; no nested-card escalation.
- **Border:** Light neutral border or semantic border where status needs emphasis.

### Navigation
- **Style:** Sticky top navigation with logo, bilingual switcher, active state, and native mobile disclosure.
- **Mobile:** The menu must remain keyboard-friendly and avoid clipped or unreachable links on narrow screens.

## 6. Do's and Don'ts

### Do:
- **Do** preserve static-first, evidence-first structure from the canonical architecture docs.
- **Do** keep dashboard status text visible alongside color indicators.
- **Do** test Thai and English at mobile widths and 200% zoom.
- **Do** keep reduced-motion and no-JavaScript states readable.

### Don't:
- **Don't** use gradient text for meaningful headings.
- **Don't** expand glassmorphism as a default container treatment.
- **Don't** use thick side-stripe borders as card accents.
- **Don't** rely on gray text over colored backgrounds.
- **Don't** add production UI changes without a controlled implementation phase.
