# Frontend Redesign — Design Spec
**Date:** 2026-03-16
**Status:** Approved

---

## Overview

Full visual redesign of Taalpad from its current flat, basic aesthetic to a **gamified, energetic** style that keeps the existing navy brand colour while adding violet accents, richer card depth, and a proper dark mode across all screens. Both light and dark modes are fully supported throughout the app (currently dark mode only affects the settings page).

---

## Design Decisions (Confirmed)

| Decision | Choice |
|---|---|
| Overall direction | Gamified & Energetic |
| Colour palette | Navy + Violet (keep brand) |
| Learn page layout | Enhanced vertical list with spine |
| Language flag | Dynamic, top-right of dashboard header |

---

## Colour System

### Light Mode Tokens

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#f8fafc` (slate-50) | Page background |
| `--color-surface` | `#ffffff` | Cards, sheets |
| `--color-border` | `#e2e8f0` (slate-200) | Card borders |
| `--color-border-strong` | `#cbd5e1` (slate-300) | Dividers |
| `--color-primary` | `#1a365d` | Navy — headers, text emphasis |
| `--color-primary-dark` | `#142a4a` | Navy hover states |
| `--color-accent` | `#7c3aed` (violet-700) | CTAs, active states, progress fills |
| `--color-accent-light` | `#ede9fe` (violet-100) | Accent tints (nav active bg, badges) |
| `--color-accent-glow` | `rgba(124,58,237,0.2)` | Progress bar glow, ring focus |
| `--color-success` | `#10b981` (emerald-500) | Correct answers, completed units |
| `--color-warning` | `#f59e0b` (amber-500) | XP, streaks, level badges |
| `--color-danger` | `#ef4444` (red-500) | Errors, due-count badges |
| `--color-text` | `#0f172a` (slate-900) | Body text |
| `--color-text-muted` | `#64748b` (slate-500) | Secondary labels |
| `--color-text-faint` | `#94a3b8` (slate-400) | Hints, captions |

### Dark Mode Tokens

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0f172a` (slate-950) | Page background |
| `--color-surface` | `rgba(255,255,255,0.04)` | Cards |
| `--color-border` | `rgba(255,255,255,0.07)` | Card borders |
| `--color-border-strong` | `rgba(255,255,255,0.12)` | Dividers |
| `--color-primary` | `#1e2d4a` | Navy header (slightly lightened for dark bg) |
| `--color-accent` | `#7c3aed` | Same violet — glows more on dark |
| `--color-accent-light` | `rgba(124,58,237,0.15)` | Accent tints |
| `--color-accent-glow` | `rgba(124,58,237,0.4)` | Stronger glow in dark |
| `--color-success` | `#10b981` | Same |
| `--color-warning` | `#f59e0b` | Same |
| `--color-danger` | `#ef4444` | Same |
| `--color-text` | `#f1f5f9` (slate-100) | Body text |
| `--color-text-muted` | `#64748b` (slate-500) | Secondary labels |
| `--color-text-faint` | `#475569` (slate-600) | Hints, captions |

### Implementation

Use Tailwind's `dark:` variant throughout. Implement a `ThemeProvider` client component that reads from `localStorage` and sets `class="dark"` on `<html>`. Add a toggle button in ProfilePage settings (replacing the non-functional current toggle). Default to system preference (`prefers-color-scheme`).

---

## Typography

No font change (keep Inter). Adjust weights and sizes for hierarchy:

- **Page titles / hero names:** `font-black` (900), `tracking-tight`
- **Section labels:** `text-[10px] font-bold uppercase tracking-widest text-muted`
- **Card titles:** `font-extrabold` (800)
- **Body / secondary:** `font-medium` (500) — bump from current 400
- **Captions / hints:** `text-[10px] font-semibold text-faint`

---

## Component Updates

### Button
- `primary`: Navy bg → keep. Add `hover:bg-[#142a4a]` transition.
- Add `accent` variant: violet gradient (`from-violet-700 to-violet-800`), white text, `shadow-[0_4px_15px_rgba(124,58,237,0.35)]` on hover.
- All variants: increase border-radius from `rounded-xl` → `rounded-2xl`, add `active:scale-[0.97]` press feedback.

### Card
- Add `shadow-sm` by default (currently only on hover).
- Border: `border-slate-200` light / `border-white/7` dark.
- `hoverable` variant: keep scale + shadow lift. Add `transition-all duration-200`.

### ProgressBar
- Violet fill replaces blue for primary progress.
- Add `glow` prop: when true, adds `shadow-[0_0_8px_var(--color-accent-glow)]` to the fill element.
- Violet progress: `bg-gradient-to-r from-violet-700 to-violet-400`.

### Badge / XPBadge
- No structural change. Update active/info badge colour from blue → violet.

### Input
- Focus ring: `ring-violet-700/20 border-violet-700` instead of current navy.

### SpeakerButton
- No change needed.

---

## Dashboard (`DashboardPage`)

### Header
- Background: `bg-gradient-to-br from-[#1a365d] via-[#1e3a5f] to-[#2d4a7a]` (richer than current flat navy).
- **Top row**: greeting label left + **language flag badge** right (see Language Flag section below).
- Name: `text-[22px] font-black tracking-tight text-white`.
- Pills row: amber pill for streak (`bg-amber-500 text-black font-black`), frosted pill for XP.
- **XP level card** (inside header): frosted `bg-white/8 border border-white/12 rounded-2xl`. Row with "Level Progress" label left + amber CEFR badge right. Violet glow progress bar below. XP caption `x / y XP · Next level at y`.

### Body
- Background: `bg-slate-50` light / `bg-slate-950` dark.
- Layout: single column on mobile, 2-col grid on desktop (unchanged from current).

#### Continue Learning card
- White surface, `border-violet-200` border, `shadow-[0_2px_12px_rgba(124,58,237,0.12)]`.
- Top row: "CONTINUE LEARNING" violet label + "Lesson N/N" violet badge.
- Unit title: `font-extrabold text-[15px] text-primary`.
- Progress bar: violet with glow.
- CTA: accent `Button` (violet gradient).

#### Streak card
- `bg-gradient-to-r from-orange-50 to-amber-50` light / `bg-amber-500/8 border-amber-500/20` dark.
- Large flame emoji with `drop-shadow`, streak number `font-black text-amber-900`, "+N XP/day" badge.

#### Stats row
- Three compact cards: Words / Lessons / Level.
- Values: navy (words), violet (lessons), amber (level).

#### Weekly chart
- Today's bar: violet gradient with upward glow shadow.
- Past days: navy (active) / violet-100 (inactive).
- Dark mode: past days `rgba(147,197,253,0.2)`, today violet gradient.
- Hover/tooltip (if present): `bg-slate-800 text-white text-xs rounded-lg px-2 py-1` dark / `bg-white border border-slate-200 text-slate-900` light. No tooltip is currently implemented — leave as-is if absent.

#### Flashcards card
- Violet gradient icon square (replaces current amber/emerald).
- Due-count badge: red, unchanged.

### Language Flag Component (`LanguageFlagBadge`)
- Props: none for now. Language is **hardcoded to `"nl"`** inside the component — no profile prop, no DB field required.
- Internal static map: `const LANGUAGES = { nl: { flag: "🇳🇱", name: "Dutch" }, fr: { flag: "🇫🇷", name: "French" }, de: { flag: "🇩🇪", name: "German" } }` — extensible for future.
- Renders: `bg-white/10 border border-white/15 rounded-full px-2.5 py-1` pill with flag emoji + language name. **No chevron** — omit it until language switching is implemented to avoid implying interactivity that doesn't exist yet.
- Non-interactive (`pointer-events-none`).
- Position: right side of header top row, flex row with greeting label.

---

## Learn Page (`LearnPage`)

### Header
- Same navy gradient header as Dashboard. Title "Learn Dutch" (or active language name). Language flag badge top-right.

### Level banner
- Pill banner for current CEFR level: navy bg, white text, amber "In Progress" badge. (Completed levels: emerald. Locked: slate.)

### Spine
- Vertical line: `bg-gradient-to-b from-violet-700 to-slate-200` (fades out below current unit).
- Node dots: violet (active, with outer ring glow), emerald (done), slate (locked).

### Unit cards
- **Active**: white surface, `border-violet-600 shadow-[0_2px_16px_rgba(124,58,237,0.15)]`. Icon square violet-tinted. Violet progress bar with glow. Accent CTA button.
- **Completed**: white surface, `border-emerald-200`. Icon square emerald. Full green progress bar. No CTA.
- **Locked**: white surface at `opacity-55`. Slate icon square with lock icon. No progress bar.
- Progress sub-label: "N/N lessons · In progress / Completed / Locked".

---

## Exercise Screen (`ExerciseScreen`)

Minimal changes — this screen works well. Updates:

- Progress bar: violet (replaces current navy in lesson phase).
- Check button: accent violet (replaces navy).
- Continue/Finish button: emerald when correct (unchanged), violet when incorrect (replaces current navy).
- Feedback banner correct: `bg-emerald-50 border-emerald-200` (unchanged).
- Feedback banner incorrect: `bg-red-50 border-red-200` (unchanged).
- Completion screen: violet confetti accent on the emoji card border.

---

## Flashcards (`FlashcardsPage`, `DeckSelector`, `StudySession`, `FlashCard`)

### DeckSelector
- Mode cards: Daily Review gets accent violet CTA (replaces current navy).
- "Due" count badge: red, unchanged.

### FlashCard
- Front: unchanged (Dutch word in navy, SpeakerButton).
- Back: `bg-gradient-to-br from-violet-800 to-violet-900` (replaces current flat navy). English translation `text-white font-black`, example `text-violet-200 italic`.

### RatingButtons
- Unchanged — Wrong/Hard/Good/Easy colour coding is already strong.

---

## Profile Page (`ProfilePage`)

### Header
- Same navy gradient header. Avatar gradient: `from-violet-400 to-primary-800` (replaces current blue-400).
- XP progress bar: violet with glow.

### Stats grid
- Streak, XP, best streak cards: unchanged values, but apply card dark mode correctly.

### Settings card
- Sound Effects toggle, Auto-play toggle: use violet as the checked/active colour (replaces current emerald for toggles).
- **Add "Theme" control**: a 3-segment button (Light | System | Dark). Renders as a pill-shaped container with three equal segments; active segment gets `bg-white dark:bg-slate-700 shadow-sm`, inactive segments are transparent. Full width of the settings row. Wires up to `useTheme().setTheme()`. Currently dark mode is broken — this fixes it.

### Reset / Sign Out buttons
- Unchanged (orange reset, red sign out — these are already distinct enough).

---

## Auth Pages (Login / Signup)

Light touch only — auth pages already look good:

- Keep the deep blue gradient layout.
- Card: increase border-radius from `rounded-3xl` → keep; add subtle `shadow-2xl` (already present).
- Input focus: violet ring (replaces navy, consistent with rest of app).
- Sign In / Create Account button: accent violet gradient (replaces flat navy).
- "Taalpad" wordmark: unchanged.

---

## Bottom Nav (`BottomNav`)

- Active item background: `bg-violet-100` (replaces `bg-primary-50`).
- Active item text/icon: `text-violet-700` (replaces `text-primary-900`).
- Background: white light / `bg-slate-950 border-white/5` dark.
- Add `backdrop-blur-sm` so it looks elevated on scroll.

## Sidebar (`Sidebar`, desktop)

- Active nav item: `bg-violet-50 text-violet-700` (replaces `bg-primary-50 text-primary-900`).
- "NL" logo mark: keep navy.
- Background: white light / `bg-slate-950 border-white/5` dark.

---

## Dark Mode Implementation

1. Add `ThemeProvider` in the **root** `app/layout.tsx` (not the `(app)` group layout) so both the protected app and the auth pages inherit the theme.
2. `ThemeProvider` reads `localStorage.getItem('theme')` on mount; defaults to `'system'` (`prefers-color-scheme`).
3. Sets `document.documentElement.classList.toggle('dark', isDark)`.
4. Exposes `useTheme()` hook returning `{ theme, setTheme }` where `theme` is `'light' | 'dark' | 'system'`.
5. Auth pages: their deep-blue gradient header looks identical in both modes — no special dark treatment needed. Body bg beneath the card becomes `bg-slate-950` in dark mode via global CSS.
6. Wire `setTheme` to the new Theme control in ProfilePage settings (see Settings card section).
7. All components use Tailwind `dark:` variants — no JS theme switching per component.
8. Ensure `tailwind.config.ts` has `darkMode: 'class'` (verify — likely already set or needs adding).

---

## Tailwind Config Changes

Add to `theme.extend.colors`:
```js
violet: { ...defaultColors.violet }, // ensure full scale available
```
Confirm `darkMode: 'class'` is set.

Add to `theme.extend.boxShadow`:
```js
'accent-glow': '0 0 12px rgba(124, 58, 237, 0.35)',
'accent-glow-lg': '0 0 24px rgba(124, 58, 237, 0.45)',
```

---

## Placement Test (`PlacementTest`, `PlacementResult`)

Light touch — screens are functional. Updates:

- **PlacementTest**: top progress bar violet (replaces navy). CEFR level badges per-question: unchanged (A1=blue, A2=violet, B1=emerald, B2=amber). Choice buttons: violet selected/checked state (replaces current primary-900). Check button: accent violet. Close (X) button: unchanged.
- **PlacementResult**: result level badge card (large 128px rounded square) — keep level-specific colours. Stats chips: `bg-slate-50` light / `bg-white/5` dark. CTA "Start learning" button: accent violet gradient.

---

## Session Summary (`SessionSummary`)

End-of-flashcard-session screen updates:

- SVG accuracy ring: unchanged colour logic (amber <50%, blue 50–80%, green >80%).
- Rating breakdown stat boxes: white surface light / `bg-white/5` dark.
- "Words improved" chip list: emerald, unchanged.
- Back + Again buttons: `secondary` and `accent` respectively.
- Dark mode: stat box borders `border-white/7`, text colours via standard dark tokens.

---

## Out of Scope

- No changes to DB schema (language flag uses hardcoded `"nl"` until multi-language feature).
- No changes to exercise logic, SM-2 algorithm, TTS, or curriculum data.
- No new pages or routes.
- No Framer Motion animations beyond what exists (can be added later).
