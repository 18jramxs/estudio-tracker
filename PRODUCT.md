# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A single user: the app's owner, an "opositor" (exam candidate) preparing for the Policía Nacional entrance exam. No accounts, no other users, no shared/multi-tenant use.

## Product Purpose

A personal study-time tracker for oposición prep. The user logs time spent per topic ("categoría", e.g. "TEMA 2") and, within a topic, per activity type ("subcategoría", e.g. Clase, Estudio, Test). Time accumulates per subcategory and rolls up into the topic total and into daily/weekly/monthly/overall stats, a streak counter, and a calendar heatmap. Success = an accurate, low-friction daily log that keeps the user honest about how much they're actually studying, and motivates consistency through visible totals/streaks.

## Positioning

Not a competitive product — a private personal utility, one of a small family of single-file tracker PWAs the user maintains for their own oposición prep (this one for study hours; siblings `gym-tracker` and `1000m` for physical training). No backend, no login, installable to the home screen, works fully offline via localStorage.

## Operating Context

Used from a phone, installed to the home screen as an iOS-style PWA (not from a browser tab day-to-day). Logged in short bursts throughout the day — after a class, after a study block, after a practice test — so the primary action (adding time) needs to be fast and low-friction. Also reviewed periodically (weekly/monthly) via the Estadísticas and Historial screens to check progress and streaks.

## Capabilities and Constraints

- Single self-contained `index.html` (inline CSS + inline JS), no build step, no framework — matches the sibling trackers' stack.
- State in `localStorage`: `estudio_categorias` (categories, each with a nested list of subcategories) and `estudio_dias` (per-day list of time entries referencing a category + optional subcategory).
- Chart.js vendored locally (`vendor/chart.umd.min.js`), not CDN-loaded — offline-first.
- No accessibility standard has been specified by the user; treat standard mobile-web a11y practice (contrast, tap targets, reduced-motion) as the baseline, not a confirmed requirement.

## Brand Commitments

App name "Estudio Tracker" is existing and not up for renaming. No existing logo/wordmark beyond the current home-screen icon (`icon.png`) — icon artwork is not in scope for this round unless the user raises it. The user explicitly asked for a reskin themed around Policía Nacional's real institutional palette (deep navy + muted gold/brass), sober and professional — no emoji, no cartoonish or literal badge/shield clipart, not kitsch.

## Evidence on Hand

No user-supplied brand assets, screenshots, or reference imagery for this round. The only visual evidence is the current shipped implementation (dark-glass aesthetic shared with sibling apps), treated as anti-reference for this redesign per the user's explicit request to move to a Policía Nacional institutional mood.

## Product Principles

1. Logging time must stay fast enough to do one-handed between study blocks — the redesign must not add friction to the core add-time action.
2. Personal, private, offline-first — no feature or visual choice should imply accounts, sync, or sharing that doesn't exist.
3. Premium and institutional, not playful — the Policía Nacional mood is sober and professional; avoid gimmicks, emoji, or literal iconography.
4. One shared visual language across the sibling tracker family in spirit (glass cards, condensed display type, bottom pill nav), even as this app's palette diverges to its own institutional theme.
